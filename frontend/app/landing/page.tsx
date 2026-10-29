'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  MapPin,
  Sparkles,
  Route,
  Navigation,
  Calendar,
  ShieldCheck,
  Coffee,
  ChevronRight,
  Star,
  Clock,
  ArrowRight,
  HelpCircle,
  Plus,
  Minus,
  CheckCircle2,
  Share2,
} from 'lucide-react';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const popularDestinations = [
    {
      title: 'Hampi Heritage Trail',
      state: 'Karnataka, India',
      image: 'https://images.unsplash.com/photo-1600100397608-f010f443b787?auto=format&fit=crop&w=800&q=80',
      duration: '3 Days',
      tag: 'Ancient Ruins & Boulders',
      stops: '6 Verified Stops',
    },
    {
      title: 'Goa Coastal Highway',
      state: 'Maharashtra & Goa',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      duration: '4 Days',
      tag: 'Beaches & Seafood',
      stops: '8 Verified Stops',
    },
    {
      title: 'Leh-Ladakh Trans-Himalayan',
      state: 'Ladakh, India',
      image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80',
      duration: '7 Days',
      tag: 'High-Altitude Pass',
      stops: '12 Verified Stops',
    },
    {
      title: 'Rajasthan Royal Route',
      state: 'Jaipur to Udaipur',
      image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
      duration: '5 Days',
      tag: 'Palaces & Forts',
      stops: '9 Verified Stops',
    },
  ];

  const features = [
    {
      icon: <Route className="w-6 h-6 text-brand-600" />,
      title: 'Intelligent Route Engine',
      description: 'Calculates optimal driving sequences, avoiding unnecessary detours and estimating accurate travel times with Google Maps Routes.',
    },
    {
      icon: <Sparkles className="w-6 h-6 text-teal-600" />,
      title: 'Google ADK Agent',
      description: 'Understands complex natural language constraints like "kid-friendly lunch stops", "avoiding toll roads", and budget preferences.',
    },
    {
      icon: <MapPin className="w-6 h-6 text-indigo-600" />,
      title: 'Verified Google Places',
      description: 'Live ratings, real opening hours, verified coordinates, and authentic photographs sourced directly through Google Maps MCP.',
    },
    {
      icon: <Coffee className="w-6 h-6 text-amber-600" />,
      title: 'Curated Pitstops & Cafes',
      description: 'Discovers highly-rated highway diners, local culinary gems, and scenic panoramic viewpoints right along your journey.',
    },
    {
      icon: <Calendar className="w-6 h-6 text-emerald-600" />,
      title: 'Dynamic Day-by-Day Timelines',
      description: 'Structured hour-by-hour schedules that adapt automatically when you adjust departure times or add extra stops.',
    },
    {
      icon: <Share2 className="w-6 h-6 text-purple-600" />,
      title: 'Export & Live Navigation',
      description: 'Save trips directly to your account, customize stops, and launch turn-by-turn navigation in one seamless click.',
    },
  ];

  const sampleItineraries = [
    {
      title: 'Hyderabad to Hampi Road Trip',
      days: '3 Days / 2 Nights',
      distance: '380 km driving',
      highlights: ['Alampur Navabrahma Temples', 'Tungabhadra Dam Sunset', 'Virupaksha Temple', 'Hippie Island Cafes'],
      budget: 'Moderate (~$180)',
    },
    {
      title: 'Mumbai to Goa Konkan Scenic Drive',
      days: '4 Days / 3 Nights',
      distance: '585 km driving',
      highlights: ['Kashid Beach Break', 'Murud-Janjira Sea Fort', 'Ganpatipule Temple', 'Anjuna Beach Sunset'],
      budget: 'Flexible (~$320)',
    },
    {
      title: 'Bengaluru to Coorg Coffee Route',
      days: '2 Days / 1 Night',
      distance: '260 km driving',
      highlights: ['Channapatna Craft Village', 'Bylakuppe Golden Temple', 'Abbey Falls', 'Coffee Estate Walk'],
      budget: 'Budget-Friendly (~$110)',
    },
  ];

  const demoTestimonials = [
    {
      name: 'Aditi Sharma',
      role: 'Road Trip Enthusiast',
      location: 'Hyderabad, India',
      quote: 'The AI planner caught scenic stops between Hyderabad and Hampi that we would have missed on standard GPS. The day-by-day pacing felt effortless.',
      rating: 5,
    },
    {
      name: 'Marcus Vance',
      role: 'Family Traveler',
      location: 'Austin, USA',
      quote: 'Planning a road trip with kids used to take days of cross-referencing maps and review sites. Google Maps AI handled the entire itinerary in under two minutes.',
      rating: 5,
    },
    {
      name: 'Priya & Rahul K.',
      role: 'Weekend Explorers',
      location: 'Bengaluru, India',
      quote: 'The ability to ask the AI "replace the afternoon stop with a quiet cafe" and watch the route recalculate instantly is a complete game changer.',
      rating: 5,
    },
  ];

  const faqs = [
    {
      q: 'How does Google Maps AI differ from regular Google Maps navigation?',
      a: 'Regular navigation focuses on getting you from point A to point B as fast as possible. Google Maps AI builds a complete vacation plan: it balances travel times with sightseeing, suggests curated restaurants along your actual route, and structures your days into realistic, enjoyable itineraries.',
    },
    {
      q: 'What is Google ADK and how is it used?',
      a: 'Google Agent Development Kit (ADK) powers our conversational intelligence. It allows the travel assistant to maintain multi-turn dialogue, understand subjective preferences, and reliably call verified Google Maps tools (via Model Context Protocol) to retrieve real coordinates, distances, and place details.',
    },
    {
      q: 'Can I customize the generated trip itinerary?',
      a: 'Yes, absolutely. You can modify your itinerary either conversationally (e.g., "Add an evening dinner spot near the river") or by adding and removing stops directly from the interactive map and timeline.',
    },
    {
      q: 'Are the place ratings and routes verified?',
      a: 'Yes. All place identifiers, ratings, reviews count, and route distances come directly from Google Maps Platform APIs. AI suggestions are explicitly validated against real geographic coordinates.',
    },
    {
      q: 'Does it work on mobile browsers?',
      a: 'Yes. Google Maps AI is fully responsive with a dedicated mobile split-view that lets you toggle between interactive chat and full-screen map views smoothly.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-slate-50 pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f018_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f018_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/80 border border-brand-200 text-brand-700 text-xs font-semibold tracking-wide shadow-subtle">
                <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Powered by Google ADK & Google Maps MCP</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-charcoal-900 tracking-tight leading-[1.12]">
                Your Next Adventure,{' '}
                <span className="bg-gradient-to-r from-brand-600 via-brand-700 to-teal-600 bg-clip-text text-transparent">
                  Planned by AI.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-charcoal-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Experience stress-free road trips and seamless journeys. Tell our AI travel assistant where you want to go, and get an optimized, day-by-day itinerary with verified Google Maps routes, hidden gems, and top-rated restaurants.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/planner"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-lg shadow-brand-600/25 active:scale-[0.98] transition-all duration-150"
                >
                  <Navigation className="w-5 h-5" />
                  <span>Plan My Trip</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </Link>

                <Link
                  href="/explore"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-charcoal-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl shadow-sm hover:shadow active:scale-[0.98] transition-all duration-150"
                >
                  <Compass className="w-5 h-5 text-brand-600" />
                  <span>Explore Destinations</span>
                </Link>
              </div>

              {/* Feature Highlights Pills */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200/80 max-w-lg mx-auto lg:mx-0">
                <div className="flex flex-col items-center lg:items-start">
                  <div className="flex items-center gap-1.5 text-charcoal-900 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Smart Routes</span>
                  </div>
                  <span className="text-xs text-charcoal-500">Live distance & time</span>
                </div>
                <div className="flex flex-col items-center lg:items-start">
                  <div className="flex items-center gap-1.5 text-charcoal-900 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-brand-600" />
                    <span>AI Itineraries</span>
                  </div>
                  <span className="text-xs text-charcoal-500">Tailored to your pace</span>
                </div>
                <div className="flex flex-col items-center lg:items-start">
                  <div className="flex items-center gap-1.5 text-charcoal-900 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>Hidden Gems</span>
                  </div>
                  <span className="text-xs text-charcoal-500">Curated pitstops</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Preview Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl bg-white p-3 shadow-xl border border-slate-200/80 ring-1 ring-slate-900/5">
                {/* Trip Card Preview */}
                <div className="relative h-64 sm:h-72 w-full rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80"
                    alt="Scenic mountain road trip"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Floating Badge */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-charcoal-900 flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                    <span>AI-Generated Plan</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="text-xs font-medium text-teal-300">3-Day Scenic Road Trip</div>
                    <div className="text-lg font-bold">Hyderabad → Hampi Heritage Corridor</div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-200">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 380 km • 6.5 hrs drive</span>
                      <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> 4.9 (12 reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Micro Steps in Card */}
                <div className="p-4 space-y-3 bg-slate-50/70 rounded-xl mt-3 border border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</div>
                    <div className="text-xs">
                      <span className="font-semibold text-charcoal-900">Stop 1: Alampur 7th-Century Temples</span>
                      <p className="text-charcoal-500">Verified stop • Recommended 75 mins • 4.7 ★</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</div>
                    <div className="text-xs">
                      <span className="font-semibold text-charcoal-900">Stop 2: Tungabhadra Sunset Point</span>
                      <p className="text-charcoal-500">Scenic viewpoint • Optimal timing 5:30 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600">Simple 3-Step Process</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
              How the AI Travel Planner Works
            </h3>
            <p className="text-charcoal-600 text-base sm:text-lg">
              Going from an idea to a fully routed journey takes seconds with intelligent agent-driven planning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 relative">
            {/* Step 1 */}
            <div className="relative flex flex-col p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-elevation transition-all">
              <div className="w-12 h-12 rounded-xl bg-brand-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-brand-500/20 mb-6">
                1
              </div>
              <h4 className="text-xl font-bold text-charcoal-900 mb-2">Share Your Dream Trip</h4>
              <p className="text-charcoal-600 text-sm leading-relaxed">
                Enter your start location, destination, duration, and personal travel preferences—or simply type in conversational English.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-elevation transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-teal-500/20 mb-6">
                2
              </div>
              <h4 className="text-xl font-bold text-charcoal-900 mb-2">AI Builds & Verifies Routes</h4>
              <p className="text-charcoal-600 text-sm leading-relaxed">
                Google ADK queries Google Maps MCP to verify real road distances, opening hours, top-rated food stops, and cultural landmarks.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-elevation transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-indigo-500/20 mb-6">
                3
              </div>
              <h4 className="text-xl font-bold text-charcoal-900 mb-2">Hit the Road & Customize</h4>
              <p className="text-charcoal-600 text-sm leading-relaxed">
                Explore your itinerary on an interactive map, tweak stops with natural language chat, and save your journey to take on the road.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600">Inspiration</h2>
              <h3 className="text-3xl font-extrabold text-charcoal-900 tracking-tight mt-1">
                Featured Road Trip Destinations
              </h3>
            </div>
            <Link
              href="/explore"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 group"
            >
              <span>Explore all destinations</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularDestinations.map((dest) => (
              <div
                key={dest.title}
                className="group flex flex-col rounded-2xl bg-white overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={dest.image}
                    alt={dest.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-charcoal-800 shadow-sm">
                    {dest.duration}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <span className="text-[11px] uppercase font-bold text-brand-600 tracking-wider">
                      {dest.state}
                    </span>
                    <h4 className="font-bold text-charcoal-900 text-base mt-1 group-hover:text-brand-600 transition-colors">
                      {dest.title}
                    </h4>
                    <p className="text-xs text-charcoal-500 mt-1">{dest.tag}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-charcoal-600">
                    <span className="font-medium">{dest.stops}</span>
                    <Link
                      href={`/planner?dest=${encodeURIComponent(dest.title)}`}
                      className="font-semibold text-brand-600 hover:underline"
                    >
                      Plan this →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section id="features" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600">Platform Features</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
              Engineered for Exceptional Road Trips
            </h3>
            <p className="text-charcoal-600 text-base sm:text-lg">
              Combining precision Google Maps Platform geospatial data with the reasoning capabilities of Google ADK.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-brand-200 hover:bg-white hover:shadow-card transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm mb-4">
                  {feat.icon}
                </div>
                <h4 className="text-lg font-bold text-charcoal-900 mb-2">{feat.title}</h4>
                <p className="text-sm text-charcoal-600 leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Road-Trip Itineraries Section */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600">Real Scenarios</h2>
            <h3 className="text-3xl font-extrabold text-charcoal-900 tracking-tight mt-1">
              Sample AI Road Trip Plans
            </h3>
            <p className="text-charcoal-600 mt-2 text-sm sm:text-base">
              See how Google Maps AI structures multi-day travel with distance calculations and curated stops.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sampleItineraries.map((itin) => (
              <div
                key={itin.title}
                className="rounded-2xl bg-white p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-brand-600 mb-2">
                    <span>{itin.days}</span>
                    <span className="text-charcoal-500 font-normal">{itin.distance}</span>
                  </div>
                  <h4 className="text-lg font-bold text-charcoal-900 mb-3">{itin.title}</h4>
                  
                  <div className="space-y-2 mt-4">
                    <span className="text-xs font-bold text-charcoal-400 uppercase tracking-wider">Key Highlights:</span>
                    <ul className="space-y-1.5 text-xs text-charcoal-600">
                      {itin.highlights.map((h) => (
                        <li key={h} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-charcoal-500">Est. Budget: <strong className="text-charcoal-900">{itin.budget}</strong></span>
                  <Link
                    href={`/planner?origin=${encodeURIComponent(itin.title.split(' to ')[0])}&destination=${encodeURIComponent(itin.title.split(' to ')[1]?.split(' ')[0] || '')}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials (Sample / Demo Data Clearly Labeled) */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-charcoal-600 text-xs font-medium mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>Sample Traveler Feedback (Simulated Demonstration)</span>
            </div>
            <h3 className="text-3xl font-extrabold text-charcoal-900 tracking-tight">
              Loved by Explorers & Road Trippers
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {demoTestimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl p-6 bg-slate-50 border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 mb-4 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-charcoal-700 text-sm leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/80">
                  <div className="font-bold text-charcoal-900 text-sm">{t.name}</div>
                  <div className="text-xs text-charcoal-500">{t.role} • {t.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600">Got Questions?</h2>
            <h3 className="text-3xl font-extrabold text-charcoal-900 tracking-tight mt-1">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={faq.q}
                className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <span className="font-bold text-charcoal-900 text-base">{faq.q}</span>
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-charcoal-600 shrink-0 ml-4">
                    {openFaq === index ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-sm text-charcoal-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 bg-gradient-to-tr from-brand-900 via-brand-800 to-teal-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Ready to plan your next unforgettable trip?
          </h2>
          <p className="text-brand-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Create an account in 30 seconds to save your trips, customize routes, and experience conversational AI travel planning.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-brand-900 bg-white hover:bg-slate-100 rounded-xl shadow-lg active:scale-95 transition-all"
            >
              Get Started for Free
            </Link>
            <Link
              href="/planner"
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-brand-700/60 hover:bg-brand-700/80 border border-white/20 rounded-xl transition-all"
            >
              Try AI Planner Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
