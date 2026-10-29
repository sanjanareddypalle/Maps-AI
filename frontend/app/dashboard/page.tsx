'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { TripPlan } from '@/lib/types';
import {
  Compass,
  Route,
  Navigation,
  MapPin,
  Sparkles,
  BookmarkCheck,
  Bookmark,
  User,
  Settings as SettingsIcon,
  LogOut,
  Calendar,
  UtensilsCrossed,
  Search,
  ArrowRight,
  Plus,
  Clock,
  ChevronRight,
  TrendingUp,
  Layers,
  ChevronLeft,
  Share2,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, preferences, logout, isLoading } = useAuth();

  const [trips, setTrips] = useState<TripPlan[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [searchPrompt, setSearchPrompt] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const userTrips = await api.getTrips();
        setTrips(userTrips);
      } catch (err) {
        console.warn('Could not load trips:', err);
      } finally {
        setLoadingTrips(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user, isLoading, router]);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPrompt.trim()) return;
    router.push(`/planner?prompt=${encodeURIComponent(searchPrompt.trim())}`);
  };

  const quickActions = [
    {
      title: 'Plan a Road Trip',
      desc: 'Calculate scenic routes, waypoints & stops',
      icon: <Route className="w-6 h-6 text-brand-600" />,
      href: '/planner',
      badge: 'Interactive AI',
    },
    {
      title: 'Explore Nearby',
      desc: 'Discover viewpoints & attractions around you',
      icon: <Compass className="w-6 h-6 text-teal-600" />,
      href: '/explore',
      badge: 'Geolocation',
    },
    {
      title: 'Find Restaurants',
      desc: 'Top-rated highway diners & local delicacies',
      icon: <UtensilsCrossed className="w-6 h-6 text-amber-600" />,
      href: '/explore?category=restaurants',
      badge: 'Google Places',
    },
    {
      title: 'Discover Hidden Gems',
      desc: 'Uncrowded historical ruins & natural spots',
      icon: <Sparkles className="w-6 h-6 text-purple-600" />,
      href: '/explore?category=gems',
      badge: 'Curated by ADK',
    },
  ];

  const suggestedDestinations = [
    {
      name: 'Hampi Heritage Corridor',
      region: 'Karnataka',
      image: 'https://images.unsplash.com/photo-1600100397608-f010f443b787?auto=format&fit=crop&w=600&q=80',
      reason: 'Matches your interest in historical monuments & architecture',
      duration: '3 Days',
    },
    {
      name: 'Western Ghats Scenic Pass',
      region: 'Maharashtra',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      reason: 'Ideal for scenic road trips with waterfalls & viewpoints',
      duration: '2-3 Days',
    },
    {
      name: 'Coorg Coffee & Mist Trails',
      region: 'Karnataka',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
      reason: 'Perfect for moderate budget nature drives and authentic local food',
      duration: '2 Days',
    },
  ];

  if (isLoading || !user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-charcoal-500 text-sm">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading your personalized dashboard...</span>
        </div>
      </div>
    );
  }

  const firstName = user.full_name?.split(' ')[0] || 'Traveler';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex">
      {/* Collapsible Sidebar */}
      <aside
        className={`bg-white border-r border-slate-200/90 transition-all duration-300 flex flex-col justify-between shrink-0 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="p-4 space-y-6">
          {/* Collapse Toggle */}
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400">
                Menu
              </span>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-slate-100 mx-auto"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm bg-brand-50 text-brand-700"
            >
              <Compass className="w-5 h-5 shrink-0 text-brand-600" />
              {!sidebarCollapsed && <span>Dashboard</span>}
            </Link>

            <Link
              href="/planner"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm text-charcoal-600 hover:bg-slate-100 hover:text-charcoal-900 transition"
            >
              <Route className="w-5 h-5 shrink-0 text-charcoal-500" />
              {!sidebarCollapsed && <span>AI Trip Planner</span>}
            </Link>

            <Link
              href="/explore"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm text-charcoal-600 hover:bg-slate-100 hover:text-charcoal-900 transition"
            >
              <Search className="w-5 h-5 shrink-0 text-charcoal-500" />
              {!sidebarCollapsed && <span>Explore Places</span>}
            </Link>

            <Link
              href="/trips"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm text-charcoal-600 hover:bg-slate-100 hover:text-charcoal-900 transition"
            >
              <BookmarkCheck className="w-5 h-5 shrink-0 text-charcoal-500" />
              {!sidebarCollapsed && <span>My Trips</span>}
            </Link>

            <Link
              href="/explore?tab=saved"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm text-charcoal-600 hover:bg-slate-100 hover:text-charcoal-900 transition"
            >
              <Bookmark className="w-5 h-5 shrink-0 text-charcoal-500" />
              {!sidebarCollapsed && <span>Saved Places</span>}
            </Link>

            <Link
              href="/onboarding"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm text-charcoal-600 hover:bg-slate-100 hover:text-charcoal-900 transition"
            >
              <Sparkles className="w-5 h-5 shrink-0 text-charcoal-500" />
              {!sidebarCollapsed && <span>Travel Preferences</span>}
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm text-charcoal-600 hover:bg-slate-100 hover:text-charcoal-900 transition"
            >
              <SettingsIcon className="w-5 h-5 shrink-0 text-charcoal-500" />
              {!sidebarCollapsed && <span>Settings</span>}
            </Link>
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-200">
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {user.full_name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-charcoal-900 truncate">{user.full_name}</div>
                  <div className="text-[11px] text-charcoal-400 truncate">{user.email}</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-charcoal-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={logout}
              className="w-full flex justify-center p-2 text-charcoal-400 hover:text-red-600 rounded-lg hover:bg-red-50"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 overflow-y-auto">
        {/* Welcome & AI Search Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-teal-800 text-white p-6 sm:p-8 shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-teal-300">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Google ADK Travel Assistant Ready</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good evening, {firstName}! Where would you like to travel next?
            </h1>
            <p className="text-sm text-brand-100 leading-relaxed">
              Describe your journey in natural language. We'll map the route, calculate distance, and recommend verified stops.
            </p>

            {/* AI Search Form */}
            <form onSubmit={handleQuickSearch} className="pt-2">
              <div className="flex flex-col sm:flex-row items-center gap-2 bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-lg">
                <div className="flex items-center gap-2.5 flex-1 px-3 w-full">
                  <Search className="w-5 h-5 text-brand-600 shrink-0" />
                  <input
                    type="text"
                    value={searchPrompt}
                    onChange={(e) => setSearchPrompt(e.target.value)}
                    placeholder="e.g. Plan a 3-day road trip from Hyderabad to Hampi with historical stops and highway diners..."
                    className="w-full bg-transparent text-charcoal-900 placeholder:text-charcoal-400 text-sm focus:outline-none py-1"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition"
                >
                  <span>Plan Trip</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((qa) => (
            <Link
              key={qa.title}
              href={qa.href}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-elevation hover:border-brand-200 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform">
                    {qa.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                    {qa.badge}
                  </span>
                </div>
                <h3 className="font-bold text-charcoal-900 text-sm group-hover:text-brand-600 transition-colors">
                  {qa.title}
                </h3>
                <p className="text-xs text-charcoal-500 mt-1 leading-snug">{qa.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end text-xs font-semibold text-brand-600 group-hover:translate-x-0.5 transition-transform">
                <span>Start now →</span>
              </div>
            </Link>
          ))}
        </div>

        {/* 2-Column Section: Recently Saved Trips & Suggested Destinations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Recently Saved Trips (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-charcoal-900">Recently Saved Trips</h2>
                <p className="text-xs text-charcoal-500">Your created itineraries and road trip plans</p>
              </div>
              <Link
                href="/trips"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>View all ({trips.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loadingTrips ? (
              <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-charcoal-400 text-sm">
                <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading your trips...
              </div>
            ) : trips.length > 0 ? (
              <div className="space-y-3">
                {trips.slice(0, 3).map((trip) => (
                  <div
                    key={trip.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-card transition flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-brand-600">{trip.total_days} Days</span>
                        <span className="text-xs text-charcoal-400">•</span>
                        <span className="text-xs text-charcoal-500">{trip.origin} → {trip.destination}</span>
                      </div>
                      <h4 className="font-bold text-charcoal-900 text-base">{trip.title}</h4>
                      <p className="text-xs text-charcoal-500 line-clamp-1">{trip.summary}</p>
                    </div>
                    <Link
                      href={`/trips?id=${trip.id}`}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-brand-50 text-charcoal-700 hover:text-brand-700 font-semibold text-xs shrink-0 transition"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              /* Honest Empty State */
              <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                  <BookmarkCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-charcoal-900 text-base">No saved trips yet</h4>
                  <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
                    Start by asking the AI Trip Planner to create an itinerary. You can save and customize it anytime.
                  </p>
                </div>
                <Link
                  href="/planner"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Plan Your First Trip</span>
                </Link>
              </div>
            )}
          </div>

          {/* AI Suggested Destinations (Right 5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-charcoal-900">Recommended For You</h2>
              <p className="text-xs text-charcoal-500">Based on your travel vibe: {preferences?.trip_type || 'historical'}</p>
            </div>

            <div className="space-y-3">
              {suggestedDestinations.map((dest) => (
                <div
                  key={dest.name}
                  className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm flex items-center gap-3 p-3 group hover:border-brand-200 transition"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-brand-600">
                      <span>{dest.region}</span>
                      <span className="text-charcoal-400 font-normal">{dest.duration}</span>
                    </div>
                    <h4 className="font-bold text-sm text-charcoal-900 truncate">{dest.name}</h4>
                    <p className="text-[11px] text-charcoal-500 line-clamp-1 mt-0.5">{dest.reason}</p>
                    <Link
                      href={`/planner?dest=${encodeURIComponent(dest.name)}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700 mt-1"
                    >
                      <span>Create Plan</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
