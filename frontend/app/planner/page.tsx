'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import {
  TripPlan,
  PlaceStop,
  LastMileTransferPlan,
  TripFeedback,
  FeedbackAnalysisResponse,
} from '@/lib/types';
import { InteractiveMap } from '@/components/map/InteractiveMap';
import { generateTripStrategyPDF } from '@/lib/pdf-export';
import {
  Sparkles,
  Route,
  Navigation,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Compass,
  Send,
  Save,
  BookmarkCheck,
  Clock,
  Car,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Share2,
  Layers,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Map as MapIcon,
  Download,
  Building2,
  Utensils,
  Train,
  Plane,
  Wallet,
  Star,
  Check,
  Bus,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  X,
  SlidersHorizontal,
  Luggage,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  tripData?: TripPlan;
}

// Helper to parse natural language prompt dynamically on client
function parseClientPrompt(prompt: string) {
  const p = prompt.toLowerCase().trim();
  const result: { destination?: string; origin?: string; days?: number; budget?: 'budget' | 'moderate' | 'premium' } = {};

  const dayMatch = p.match(/(\d+)\s*(?:-| )*(?:day|days|d\b)/);
  if (dayMatch) {
    result.days = parseInt(dayMatch[1], 10);
  } else if (p.includes('weekend')) {
    result.days = 2;
  } else if (p.includes('week')) {
    result.days = 7;
  }

  const destMatch = p.match(/(?:to|visit|explore|in|at)\s+([a-zA-Z\s]+?)(?:\s+(?:with|for|from|in|\d+)|$)/);
  if (destMatch && destMatch[1]) {
    const raw = destMatch[1].trim().replace(/\b(trip|tour|roadtrip|road trip|vacation)\b/gi, '').trim();
    if (raw.length >= 3) {
      result.destination = raw.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }

  if (!result.destination) {
    const knownSpots = [
      'coimbatore adiyogi',
      'adiyogi',
      'coimbatore',
      'ooty',
      'goa',
      'hampi',
      'jaipur',
      'coorg',
      'munnar',
      'manali',
      'leh ladakh',
      'kerala',
    ];
    for (const spot of knownSpots) {
      if (p.includes(spot)) {
        result.destination = spot.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        break;
      }
    }
  }

  const origMatch = p.match(/(?:from|starting from|start at)\s+([a-zA-Z\s]+?)(?:\s+(?:to|for|\d+)|$)/);
  if (origMatch && origMatch[1]) {
    const raw = origMatch[1].trim();
    if (raw.length >= 3) {
      result.origin = raw.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }

  if (p.includes('budget') || p.includes('affordable') || p.includes('cheap')) {
    result.budget = 'budget';
  } else if (p.includes('luxury') || p.includes('premium') || p.includes('5 star')) {
    result.budget = 'premium';
  } else if (p.includes('moderate') || p.includes('comfort')) {
    result.budget = 'moderate';
  }

  return result;
}

function PlannerContent() {
  const searchParams = useSearchParams();
  const { user, preferences } = useAuth();

  // Mobile view toggle ('chat' | 'map')
  const [mobileTab, setMobileTab] = useState<'chat' | 'map'>('chat');

  // Trip Input Form State
  const [origin, setOrigin] = useState(searchParams.get('origin') || 'Hyderabad');
  const [destination, setDestination] = useState(searchParams.get('destination') || searchParams.get('dest') || 'Hampi');
  const [days, setDays] = useState(preferences?.duration_days || 3);
  const [travelers, setTravelers] = useState(2);
  const [mode, setMode] = useState(preferences?.transportation || 'driving');
  const [budget, setBudget] = useState(preferences?.budget || 'moderate');
  const [interests, setInterests] = useState<string[]>(
    preferences?.interests?.length ? preferences.interests : ['Historical monuments', 'Scenic views', 'Local cuisine']
  );

  // Feature 1: Last-Mile Parameters
  const [showAdvancedTransit, setShowAdvancedTransit] = useState(false);
  const [arrivalHub, setArrivalHub] = useState('');
  const [accommodationName, setAccommodationName] = useState('');
  const [luggage, setLuggage] = useState<'light' | 'moderate' | 'heavy'>('moderate');

  // Active Trip Plan
  const [currentTrip, setCurrentTrip] = useState<TripPlan | null>(null);
  const [selectedStop, setSelectedStop] = useState<PlaceStop | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingTrip, setSavingTrip] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Strategy Panel Bottom Tab State
  const [strategyTab, setStrategyTab] = useState<'stops' | 'enroute' | 'hotels' | 'dining' | 'transit' | 'transfers' | 'budget'>('stops');

  // Feature 1: Custom Inter-Stop Transfer Tool State
  const [interStopOrigin, setInterStopOrigin] = useState('');
  const [interStopDest, setInterStopDest] = useState('');
  const [interStopLoading, setInterStopLoading] = useState(false);
  const [interStopPlan, setInterStopPlan] = useState<LastMileTransferPlan | null>(null);

  // Feature 2: User Reviews & Feedback State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackTags, setFeedbackTags] = useState<string[]>(['Helpful', 'Accurate']);
  const [feedbackIssues, setFeedbackIssues] = useState<string[]>([]);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Feature 2: Reviews & AI Improvement Insights Modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [analysisData, setAnalysisData] = useState<FeedbackAnalysisResponse | null>(null);
  const [recentReviews, setRecentReviews] = useState<TripFeedback[]>([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // Conversational Chat State
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load initial prompt or trigger auto-plan if query params are present
  useEffect(() => {
    const promptQuery = searchParams.get('prompt');
    const destParam = searchParams.get('destination') || searchParams.get('dest');
    const origParam = searchParams.get('origin');

    setMessages([
      {
        id: 'msg-1',
        sender: 'assistant',
        text: `Hello! I'm your Google Maps AI Travel Architect. Tell me where you'd like to travel, or adjust the parameters on the left to start your customized itinerary with complete last-mile transfers and budget breakdown.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    if (promptQuery) {
      setChatInput(promptQuery);
      const parsed = parseClientPrompt(promptQuery);
      const initialDest = parsed.destination || destParam || destination;
      const initialOrig = parsed.origin || origParam || origin;
      const initialDays = parsed.days || days;
      const initialBudget = parsed.budget || budget;

      if (parsed.destination) setDestination(parsed.destination);
      if (parsed.origin) setOrigin(parsed.origin);
      if (parsed.days) setDays(parsed.days);
      if (parsed.budget) setBudget(parsed.budget);

      handlePlanTrip(true, promptQuery, {
        origin: initialOrig,
        destination: initialDest,
        days: initialDays,
        budget: initialBudget,
      });
    } else if (origin && destination) {
      handlePlanTrip(false);
    }
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handlePlanTrip = async (
    fromChat: boolean = false,
    customPrompt?: string,
    overrides?: { origin?: string; destination?: string; days?: number; budget?: 'budget' | 'moderate' | 'premium' }
  ) => {
    const activeOrigin = (overrides?.origin || origin).trim();
    const activeDestination = (overrides?.destination || destination).trim();
    const activeDays = overrides?.days ?? days;
    const activeBudget = overrides?.budget ?? budget;

    if (!activeOrigin || !activeDestination) {
      setError('Please provide both an origin and destination.');
      return;
    }

    setLoading(true);
    setError(null);
    setSaveSuccess(false);

    const userQuery =
      customPrompt ||
      `Plan an optimized ${activeDays}-day travel strategy from ${activeOrigin} to ${activeDestination} for ${travelers} travelers with a ${activeBudget} budget.`;

    if (fromChat) {
      setMessages((prev) => [
        ...prev,
        {
          id: `usr-${Date.now()}`,
          sender: 'user',
          text: userQuery,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setChatInput('');
    }

    try {
      const plan = await api.planTrip({
        origin: activeOrigin,
        destination: activeDestination,
        days: Number(activeDays),
        travelers: Number(travelers),
        mode,
        budget: activeBudget,
        interests,
        prompt: userQuery,
        arrival_hub: arrivalHub.trim() || undefined,
        accommodation_name: accommodationName.trim() || undefined,
        luggage,
      } as any);

      setCurrentTrip(plan);
      setOrigin(plan.origin);
      setDestination(plan.destination);
      setDays(plan.total_days);
      if (plan.budget_level) {
        setBudget(plan.budget_level as any);
      }

      if (plan.itinerary?.length && plan.itinerary[0]?.stops?.length) {
        setSelectedStop(plan.itinerary[0].stops[0]);
      }

      const totalStops = plan.itinerary.reduce((acc, d) => acc + d.stops.length, 0);

      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: `I've prepared your comprehensive travel strategy from ${plan.origin} to ${plan.destination}! It covers ${plan.total_days} days, ${totalStops} destination attractions, ${plan.en_route_stops?.length || 0} en-route stops, verified last-mile arrival transfers (cabs, shuttles, metro), and full accommodation & dining recommendations.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          tripData: plan,
        },
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to plan trip. Please verify your inputs and try again.');
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-err-${Date.now()}`,
          sender: 'assistant',
          text: `I encountered an issue calculating the route: ${err.message || 'Please check the locations or try another corridor.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!currentTrip) return;
    if (!user) {
      setError('Please sign in or create an account to save this trip to your profile.');
      return;
    }

    setSavingTrip(true);
    try {
      await api.saveTrip(currentTrip);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Could not save trip to your account.');
    } finally {
      setSavingTrip(false);
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const query = chatInput.trim();
    const parsed = parseClientPrompt(query);

    const newDest = parsed.destination || destination;
    const newDays = parsed.days || days;
    const newOrigin = parsed.origin || origin;
    const newBudget = parsed.budget || budget;

    if (parsed.destination) setDestination(parsed.destination);
    if (parsed.days) setDays(parsed.days);
    if (parsed.origin) setOrigin(parsed.origin);
    if (parsed.budget) setBudget(parsed.budget);

    handlePlanTrip(true, query, {
      destination: newDest,
      days: newDays,
      origin: newOrigin,
      budget: newBudget,
    });
  };

  // Feature 1: Plan Inter-Stop / Custom Transfer
  const handleCalculateInterStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interStopOrigin.trim() || !interStopDest.trim()) return;

    setInterStopLoading(true);
    try {
      const plan = await api.planLastMileTransfer({
        origin_hub: interStopOrigin.trim(),
        destination_place: interStopDest.trim(),
        hub_type: 'hotel',
        destination_city: destination,
        passengers: travelers,
        luggage,
        budget_preference: budget,
      });
      setInterStopPlan(plan);
    } catch (err: any) {
      setError(err.message || 'Could not calculate inter-stop transfer.');
    } finally {
      setInterStopLoading(false);
    }
  };

  // Feature 2: Submit Feedback
  const handleSubmitFeedback = async () => {
    setSubmittingFeedback(true);
    try {
      await api.submitFeedback({
        trip_id: currentTrip?.id,
        rating,
        written_feedback: feedbackComment.trim(),
        quick_tags: feedbackTags,
        issues: feedbackIssues,
        category_ratings: {
          route_quality: rating,
          transport: rating,
          cost_accuracy: rating,
          recommendations: rating,
        },
        origin,
        destination,
      });
      setFeedbackSuccess(true);
      setTimeout(() => setFeedbackSuccess(false), 5000);
      setFeedbackComment('');
    } catch (err: any) {
      setError(err.message || 'Could not submit feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Feature 2: Open Review Analysis Insights
  const handleOpenAnalysisModal = async () => {
    setShowFeedbackModal(true);
    setLoadingAnalysis(true);
    try {
      const [analysis, reviews] = await Promise.all([
        api.getFeedbackAnalysis(),
        api.getFeedback(20),
      ]);
      setAnalysisData(analysis);
      setRecentReviews(reviews);
    } catch (err) {
      console.warn('Could not load analysis:', err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Flatten all stops from itinerary for the map
  const allStops: PlaceStop[] = currentTrip?.itinerary
    ? currentTrip.itinerary.flatMap((d) => d.stops)
    : [];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-50 overflow-hidden">
      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex items-center justify-around bg-white border-b border-slate-200 px-4 py-2 shrink-0">
        <button
          onClick={() => setMobileTab('chat')}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition ${
            mobileTab === 'chat' ? 'bg-brand-50 text-brand-700' : 'text-charcoal-600'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat & Parameters</span>
        </button>
        <button
          onClick={() => setMobileTab('map')}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition ${
            mobileTab === 'map' ? 'bg-brand-50 text-brand-700' : 'text-charcoal-600'
          }`}
        >
          <MapIcon className="w-4 h-4" />
          <span>Interactive Map ({allStops.length} stops)</span>
        </button>
      </div>

      {/* Main Split-View Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel: Form & Conversational Assistant (50% on Desktop) */}
        <div
          className={`lg:w-1/2 flex flex-col bg-white border-r border-slate-200/90 overflow-hidden ${
            mobileTab === 'chat' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Trip Parameters Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 space-y-3 shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-500 mb-1">
                  Starting Point
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-brand-600" />
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="e.g. Hyderabad"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-charcoal-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-500 mb-1">
                  Destination
                </label>
                <div className="relative">
                  <Navigation className="w-4 h-4 absolute left-3 top-3 text-teal-600" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Hampi"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-charcoal-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-400 mb-0.5">
                  Duration
                </label>
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full py-1.5 px-2 rounded-lg border border-slate-200 text-xs text-charcoal-800 font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value={1}>1 Day</option>
                  <option value={2}>2 Days</option>
                  <option value={3}>3 Days</option>
                  <option value={4}>4 Days</option>
                  <option value={5}>5 Days</option>
                  <option value={7}>7 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-400 mb-0.5">
                  Budget
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value as any)}
                  className="w-full py-1.5 px-2 rounded-lg border border-slate-200 text-xs text-charcoal-800 font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="budget">Budget</option>
                  <option value="moderate">Moderate</option>
                  <option value="premium">Premium</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => handlePlanTrip(false)}
                  disabled={loading}
                  className="w-full py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{loading ? 'Routing...' : '🚀 Plan Trip'}</span>
                </button>
              </div>
            </div>

            {/* Feature 1: Advanced Transportation & Last-Mile Dropdown */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvancedTransit(!showAdvancedTransit)}
                className="flex items-center gap-1.5 text-[11px] font-bold text-brand-700 hover:text-brand-900 focus:outline-none"
              >
                <SlidersHorizontal className="w-3 h-3 text-brand-600" />
                <span>
                  {showAdvancedTransit ? 'Hide Airport / Station & Hotel Details' : '+ Add Arrival Airport / Station & Hotel Destination'}
                </span>
                {showAdvancedTransit ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {showAdvancedTransit && (
                <div className="mt-2.5 p-3 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2.5 text-xs">
                  <div className="text-[11px] font-bold text-blue-900 flex items-center gap-1">
                    <Bus className="w-3.5 h-3.5 text-blue-600" />
                    <span>Arrival Hub & Last-Mile Transit Setup</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-charcoal-600 mb-0.5">
                        Arrival Airport / Station
                      </label>
                      <input
                        type="text"
                        value={arrivalHub}
                        onChange={(e) => setArrivalHub(e.target.value)}
                        placeholder="e.g. Goa Mopa Airport (GOX)"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-charcoal-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-charcoal-600 mb-0.5">
                        Hotel / Accommodation
                      </label>
                      <input
                        type="text"
                        value={accommodationName}
                        onChange={(e) => setAccommodationName(e.target.value)}
                        placeholder="e.g. Taj Fort Aguada / Calangute Resort"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-charcoal-900"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-charcoal-600 font-medium">Luggage Load:</span>
                    <div className="flex items-center gap-1">
                      {(['light', 'moderate', 'heavy'] as const).map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setLuggage(l)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize transition ${
                            luggage === l ? 'bg-blue-600 text-white' : 'bg-white text-charcoal-600 border border-slate-200'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Feature 2: Review Insights Dashboard Trigger */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
              <button
                type="button"
                onClick={handleOpenAnalysisModal}
                className="flex items-center gap-1 font-bold text-amber-700 hover:text-amber-900 hover:underline"
              >
                <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
                <span>📊 Traveler Reviews & AI Improvement Insights</span>
              </button>

              {currentTrip && (
                <button
                  type="button"
                  onClick={handleSaveTrip}
                  disabled={savingTrip}
                  className="flex items-center gap-1 font-bold text-brand-600 hover:text-brand-800"
                >
                  {saveSuccess ? (
                    <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>{saveSuccess ? 'Saved!' : 'Save Trip'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Feedback & Improvement Insights Modal (Feature 2) */}
          {showFeedbackModal && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-charcoal-900 text-sm">Traveler Reviews & AI Continuous Improvement</h3>
                      <p className="text-[11px] text-charcoal-500">How feedback directly optimizes future route and pricing calculations</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFeedbackModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                  {loadingAnalysis ? (
                    <div className="py-12 text-center text-charcoal-500">Loading feedback intelligence...</div>
                  ) : analysisData ? (
                    <>
                      {/* Summary Score Header */}
                      <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-black text-amber-900 flex items-center gap-1.5">
                            <span>{analysisData.average_overall_rating}</span>
                            <span className="text-amber-500 text-lg">★</span>
                            <span className="text-xs text-charcoal-500 font-semibold">/ 5.0 Rating</span>
                          </div>
                          <div className="text-[11px] text-charcoal-600 mt-0.5">
                            Based on {analysisData.total_reviews} verified community reviews
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-right">
                          <div className="text-[10px] text-charcoal-600">
                            Route Quality: <strong className="text-charcoal-900">{analysisData.category_averages?.route_quality || 4.8}★</strong>
                          </div>
                          <div className="text-[10px] text-charcoal-600">
                            Transport Accuracy: <strong className="text-charcoal-900">{analysisData.category_averages?.transport || 4.7}★</strong>
                          </div>
                        </div>
                      </div>

                      {/* AI Improvement Statement */}
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-charcoal-700 space-y-1">
                        <div className="font-bold text-blue-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          <span>AI Feedback-Driven Planner Evolution</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-blue-950">
                          {analysisData.ai_improvement_summary}
                        </p>
                      </div>

                      {/* Recurring Issues & Automated Remediation */}
                      <div className="space-y-2">
                        <div className="font-bold text-charcoal-900 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-orange-600" />
                          <span>Recurring Problem Trends & Auto-Remedies Applied</span>
                        </div>

                        <div className="space-y-1.5">
                          {analysisData.recurring_issues?.map((iss) => (
                            <div
                              key={iss.issue_code}
                              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                            >
                              <div>
                                <div className="font-bold text-charcoal-900">{iss.label}</div>
                                <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                                  Action Applied: {iss.remedy_action}
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0 self-start sm:self-center">
                                {iss.count} occurrences ({iss.percentage}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recent Community Reviews List */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="font-bold text-charcoal-900">Recent Traveler Reviews</div>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {recentReviews.map((rev) => (
                            <div key={rev.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-charcoal-900">{rev.user_name || 'Traveler'}</span>
                                <span className="font-bold text-amber-600">★ {rev.rating}</span>
                              </div>
                              {rev.written_feedback && (
                                <p className="text-[11px] text-charcoal-600 italic">"{rev.written_feedback}"</p>
                              )}
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {rev.quick_tags?.map((tag) => (
                                  <span key={tag} className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {/* Conversational Assistant Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-brand-600 text-white rounded-br-sm'
                      : 'bg-slate-100 text-charcoal-800 rounded-bl-sm border border-slate-200/60'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-brand-200' : 'text-charcoal-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleChatSubmit}
            className="p-3 border-t border-slate-200/80 bg-white flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask anything: 'Find metro transfer', 'Add Goa Mopa airport', 'Make it budget'..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={loading || !chatInput.trim()}
              className="p-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition disabled:opacity-40 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Panel: Interactive Map & Comprehensive Strategy Tabs */}
        <div
          className={`lg:w-1/2 flex flex-col bg-slate-100 overflow-hidden ${
            mobileTab === 'map' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Top Half: Interactive Map */}
          <div className="flex-1 relative min-h-[300px] overflow-hidden">
            <InteractiveMap
              origin={origin}
              destination={destination}
              stops={allStops}
              selectedStop={selectedStop}
              onSelectStop={(s) => setSelectedStop(s)}
            />
          </div>

          {/* Bottom Half: Strategy Explorer Tabs */}
          {currentTrip && (
            <div className="h-64 sm:h-72 bg-white border-t border-slate-200 p-3 sm:p-4 overflow-hidden flex flex-col shrink-0">
              {/* Tab Header Bar */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs font-bold shrink-0">
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    onClick={() => setStrategyTab('stops')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                      strategyTab === 'stops' ? 'bg-brand-600 text-white' : 'text-charcoal-600 hover:bg-slate-100'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Stops ({allStops.length})</span>
                  </button>

                  <button
                    onClick={() => setStrategyTab('transfers')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                      strategyTab === 'transfers' ? 'bg-brand-600 text-white' : 'text-charcoal-600 hover:bg-slate-100'
                    }`}
                  >
                    <Bus className="w-3.5 h-3.5" />
                    <span>🚖 Last-Mile Transfers</span>
                  </button>

                  <button
                    onClick={() => setStrategyTab('enroute')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                      strategyTab === 'enroute' ? 'bg-brand-600 text-white' : 'text-charcoal-600 hover:bg-slate-100'
                    }`}
                  >
                    <Route className="w-3.5 h-3.5" />
                    <span>En-Route ({currentTrip.en_route_stops?.length || 0})</span>
                  </button>

                  <button
                    onClick={() => setStrategyTab('hotels')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                      strategyTab === 'hotels' ? 'bg-brand-600 text-white' : 'text-charcoal-600 hover:bg-slate-100'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Hotels</span>
                  </button>

                  <button
                    onClick={() => setStrategyTab('dining')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                      strategyTab === 'dining' ? 'bg-brand-600 text-white' : 'text-charcoal-600 hover:bg-slate-100'
                    }`}
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Dining</span>
                  </button>

                  <button
                    onClick={() => setStrategyTab('transit')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                      strategyTab === 'transit' ? 'bg-brand-600 text-white' : 'text-charcoal-600 hover:bg-slate-100'
                    }`}
                  >
                    <Train className="w-3.5 h-3.5" />
                    <span>Corridor Routes</span>
                  </button>

                  <button
                    onClick={() => setStrategyTab('budget')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                      strategyTab === 'budget' ? 'bg-brand-600 text-white' : 'text-charcoal-600 hover:bg-slate-100'
                    }`}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Budgets</span>
                  </button>
                </div>

                <button
                  onClick={() => generateTripStrategyPDF(currentTrip)}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition shrink-0 ml-2"
                  title="Download complete travel strategy report in PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download PDF</span>
                </button>
              </div>

              {/* Tab Content Area */}
              <div className="flex-1 overflow-y-auto">
                {/* Feature 1: Last-Mile Transfers Tab */}
                {strategyTab === 'transfers' && (
                  <div className="space-y-3 pr-1 text-xs">
                    {currentTrip.last_mile_transfers ? (
                      <>
                        <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-blue-700">Arrival Transfer Route</span>
                            <div className="font-bold text-charcoal-900 text-xs">
                              {currentTrip.last_mile_transfers.hub_name} ➔ {currentTrip.last_mile_transfers.destination_name}
                            </div>
                            <div className="text-[10px] text-charcoal-500">
                              Estimated distance: {currentTrip.last_mile_transfers.distance_km} km • Best Choice: {currentTrip.last_mile_transfers.recommendation_reason}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold text-[10px] shrink-0 self-start sm:self-center">
                            Verified Hub Route
                          </span>
                        </div>

                        {/* Options Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                          {currentTrip.last_mile_transfers.options?.map((opt) => {
                            const isBest = opt.id === currentTrip.last_mile_transfers?.best_recommendation_id;
                            return (
                              <div
                                key={opt.id}
                                className={`p-2.5 rounded-xl border text-xs space-y-1.5 flex flex-col justify-between transition ${
                                  isBest
                                    ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-400'
                                    : 'bg-slate-50 border-slate-200 hover:border-blue-300'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-charcoal-900 truncate">{opt.title}</span>
                                    {isBest && (
                                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">
                                        Best Pick
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-charcoal-500 mt-0.5">{opt.provider}</div>
                                  <div className="font-extrabold text-blue-700 text-[11px] mt-1">
                                    {opt.estimated_fare}
                                    {opt.is_verified_fare ? (
                                      <span className="ml-1 text-[9px] font-semibold text-emerald-700 bg-emerald-100 px-1 rounded">
                                        Fixed
                                      </span>
                                    ) : (
                                      <span className="ml-1 text-[9px] font-semibold text-slate-500 bg-slate-200/70 px-1 rounded">
                                        Est.
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-charcoal-600 mt-0.5">
                                    ⏱ {opt.duration_text} • 🧳 {opt.luggage_capacity}
                                  </div>
                                </div>

                                <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between">
                                  <span className="text-[10px] text-amber-600 font-bold">
                                    {'★'.repeat(opt.convenience_score)}
                                  </span>
                                  {opt.booking_link && (
                                    <a
                                      href={opt.booking_link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-white px-2 py-0.5 rounded border border-slate-200"
                                    >
                                      <span>Book / Info</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="p-4 text-center text-charcoal-500">
                        No arrival transfer generated yet. Specify your arrival airport or railway station in parameters.
                      </div>
                    )}

                    {/* Quick Inter-Stop Transfer Tool */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="font-bold text-charcoal-800 text-[11px] mb-1.5 flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-blue-600" />
                        <span>Plan Custom Transfer (e.g. Hotel to Attraction / Restaurant)</span>
                      </div>
                      <form onSubmit={handleCalculateInterStop} className="flex flex-col sm:flex-row gap-1.5">
                        <input
                          type="text"
                          placeholder="From: Hotel / Stop..."
                          value={interStopOrigin}
                          onChange={(e) => setInterStopOrigin(e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs flex-1"
                        />
                        <input
                          type="text"
                          placeholder="To: Monument / Beach..."
                          value={interStopDest}
                          onChange={(e) => setInterStopDest(e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs flex-1"
                        />
                        <button
                          type="submit"
                          disabled={interStopLoading}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shrink-0 transition"
                        >
                          {interStopLoading ? 'Calculating...' : 'Compare Options'}
                        </button>
                      </form>

                      {interStopPlan && (
                        <div className="mt-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                          <div className="font-bold text-charcoal-900">
                            Transfer: {interStopPlan.hub_name} ➔ {interStopPlan.destination_name} ({interStopPlan.distance_km} km)
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                            {interStopPlan.options.slice(0, 3).map((o) => (
                              <div key={o.id} className="p-1.5 rounded bg-white border border-slate-200 text-[10px]">
                                <div className="font-bold text-charcoal-900">{o.title}</div>
                                <div className="text-blue-700 font-bold">{o.estimated_fare} • {o.duration_text}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 1: Itinerary Stops */}
                {strategyTab === 'stops' && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {allStops.map((stop, idx) => {
                      const isSelected = selectedStop?.id === stop.id || selectedStop?.name === stop.name;
                      return (
                        <div
                          key={`${stop.id || stop.name}-${idx}`}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
                            isSelected
                              ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-400/40'
                              : 'bg-slate-100 text-charcoal-700 hover:bg-slate-200'
                          }`}
                        >
                          <button
                            onClick={() => setSelectedStop(stop)}
                            className="flex items-center gap-1.5 focus:outline-none"
                          >
                            <span
                              className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                                isSelected ? 'bg-white text-brand-700' : 'bg-charcoal-300 text-charcoal-900'
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <span className="truncate max-w-[120px]">{stop.name}</span>
                          </button>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.name + ' ' + (stop.address || ''))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-0.5 rounded transition ${isSelected ? 'text-white/80 hover:text-white' : 'text-charcoal-400 hover:text-brand-600'}`}
                            title="Open place in Google Maps"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Tab 2: En-Route Stops */}
                {strategyTab === 'enroute' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-52 overflow-y-auto pr-1">
                    {currentTrip.en_route_stops?.map((stop) => (
                      <div
                        key={stop.id}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs space-y-1.5 flex flex-col justify-between hover:border-brand-300 transition"
                      >
                        <div>
                          <div className="font-bold text-charcoal-900 truncate">{stop.name}</div>
                          <div className="text-[11px] text-charcoal-500 line-clamp-1">{stop.reason || stop.address}</div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-brand-600 font-semibold pt-1 border-t border-slate-200/60">
                          <span>★ {stop.rating || '4.6'} • {stop.time_to_spend_minutes || 45} mins</span>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.name + ' ' + (stop.address || ''))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-800 hover:underline"
                          >
                            <span>Directions</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 3: Hotels & Stays */}
                {strategyTab === 'hotels' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-h-52 overflow-y-auto pr-1">
                    {currentTrip.hotel_recommendations?.map((hotel) => {
                      const bookingUrl =
                        hotel.booking_url ||
                        `https://www.google.com/travel/hotels?q=${encodeURIComponent(hotel.name + ' ' + (hotel.address || destination))}`;

                      return (
                        <div
                          key={hotel.id}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs space-y-1.5 flex flex-col justify-between hover:border-brand-300 transition"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-brand-100 text-brand-700">
                                {hotel.tier}
                              </span>
                              <span className="font-bold text-amber-600 text-[11px]">★ {hotel.rating}</span>
                            </div>
                            <div className="font-bold text-charcoal-900 mt-1 truncate">{hotel.name}</div>
                            <div className="text-[11px] text-brand-700 font-bold">{hotel.price_per_night}</div>
                          </div>

                          <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between gap-1">
                            <span className="text-[10px] text-charcoal-500 line-clamp-1">
                              {hotel.amenities?.slice(0, 2).join(' • ')}
                            </span>
                            <a
                              href={bookingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-600 hover:text-brand-800 shrink-0 hover:underline bg-white px-2 py-0.5 rounded-md border border-slate-200"
                            >
                              <span>Book</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Tab 4: Dining */}
                {strategyTab === 'dining' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-h-52 overflow-y-auto pr-1">
                    {currentTrip.dining_recommendations?.map((dish) => {
                      const diningUrl =
                        dish.booking_url ||
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dish.name + ' ' + (dish.address || destination))}`;

                      return (
                        <div
                          key={dish.id}
                          className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1.5 flex flex-col justify-between hover:border-emerald-300 transition"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                {dish.meal_type}
                              </span>
                              <span className="font-bold text-amber-600 text-[11px]">★ {dish.rating}</span>
                            </div>
                            <div className="font-bold text-charcoal-900 truncate mt-0.5">{dish.name}</div>
                            <div className="text-[11px] text-charcoal-600 line-clamp-1">{dish.specialty_dish}</div>
                          </div>

                          <div className="pt-1 border-t border-emerald-200/60 flex items-center justify-between gap-1">
                            <span className="text-[10px] text-emerald-800 font-semibold">{dish.price_range}</span>
                            <a
                              href={diningUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-900 shrink-0 hover:underline bg-white px-2 py-0.5 rounded-md border border-emerald-200"
                            >
                              <span>Menu</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Tab 5: Transit Routes */}
                {strategyTab === 'transit' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-h-52 overflow-y-auto pr-1">
                    {currentTrip.travel_options?.map((t) => {
                      const transitUrl =
                        t.booking_url ||
                        (t.mode === 'flight'
                          ? `https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(origin)}+to+${encodeURIComponent(destination)}`
                          : t.mode === 'train'
                          ? `https://www.confirmtkt.com/train-running-status?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(destination)}`
                          : `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`);

                      const btnLabel = t.mode === 'flight' ? 'Book Flight' : t.mode === 'train' ? 'Book IRCTC' : 'Directions';

                      return (
                        <div
                          key={t.mode}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 flex flex-col justify-between hover:border-brand-300 transition"
                        >
                          <div>
                            <div className="flex items-center gap-1 font-bold text-brand-700">
                              {t.mode === 'road' ? <Car className="w-3.5 h-3.5" /> : t.mode === 'train' ? <Train className="w-3.5 h-3.5" /> : <Plane className="w-3.5 h-3.5" />}
                              <span className="truncate">{t.title}</span>
                            </div>
                            <div className="text-[11px] text-charcoal-800 font-semibold mt-1">{t.duration_text}</div>
                            <div className="text-[10px] text-charcoal-500 line-clamp-1">{t.distance_or_transit}</div>
                          </div>

                          <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between gap-1">
                            <span className="text-[10px] text-emerald-700 font-bold truncate max-w-[130px]">{t.estimated_cost}</span>
                            <a
                              href={transitUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-600 hover:text-brand-800 shrink-0 hover:underline bg-white px-2 py-0.5 rounded-md border border-slate-200"
                            >
                              <span>{btnLabel}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Tab 6: Budgets */}
                {strategyTab === 'budget' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-h-52 overflow-y-auto pr-1">
                    {currentTrip.budget_breakdown?.map((b) => (
                      <div
                        key={b.tier}
                        className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1.5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-charcoal-900 uppercase text-[10px]">{b.tier}</span>
                            <span className="font-bold text-amber-800">{b.total_estimated}</span>
                          </div>
                          <div className="text-[10px] text-charcoal-600 mt-1">
                            Stay: {b.stay_cost.split(' ')[1]} | Food: {b.food_cost.split(' ')[1]}
                          </div>
                          <div className="text-[10px] text-charcoal-500 line-clamp-2 mt-0.5">{b.description}</div>
                        </div>
                        <div className="pt-1 border-t border-amber-200/60 text-[9px] text-amber-900 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3 text-amber-700" />
                          <span>Includes Transit & Sightseeing</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Feature 2: Post-Plan Review & Feedback Bar */}
              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between shrink-0 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-charcoal-700">Rate this strategy:</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        key={starVal}
                        type="button"
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(starVal)}
                        className="p-0.5 text-slate-300 hover:scale-110 transition"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            (hoverRating || rating) >= starVal ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {feedbackSuccess ? (
                    <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Thank you for your review!</span>
                    </span>
                  ) : (
                    <button
                      onClick={handleSubmitFeedback}
                      disabled={submittingFeedback}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] transition"
                    >
                      {submittingFeedback ? 'Submitting...' : 'Submit Review'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 text-sm text-charcoal-500">
          Loading AI Trip Planner...
        </div>
      }
    >
      <PlannerContent />
    </Suspense>
  );
}
