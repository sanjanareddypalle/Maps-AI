'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { TripPlan } from '@/lib/types';
import {
  BookmarkCheck,
  Calendar,
  Route,
  Navigation,
  MapPin,
  Clock,
  Trash2,
  Copy,
  Edit3,
  Plus,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  X,
  Share2,
} from 'lucide-react';

export default function TripsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [trips, setTrips] = useState<TripPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<TripPlan | null>(null);

  // Delete modal state
  const [deleteModalTrip, setDeleteModalTrip] = useState<TripPlan | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Edit modal state
  const [editingTrip, setEditingTrip] = useState<TripPlan | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBudget, setEditBudget] = useState('moderate');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadTrips();
    }
  }, [user, isLoading, router]);

  const loadTrips = async () => {
    try {
      const userTrips = await api.getTrips();
      setTrips(userTrips);
      if (userTrips.length > 0 && !selectedTrip) {
        setSelectedTrip(userTrips[0]);
      }
    } catch (err) {
      console.warn('Could not load trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!deleteModalTrip?.id) return;
    setDeleting(true);
    try {
      await api.deleteTrip(deleteModalTrip.id);
      setTrips(trips.filter((t) => t.id !== deleteModalTrip.id));
      if (selectedTrip?.id === deleteModalTrip.id) {
        setSelectedTrip(trips.find((t) => t.id !== deleteModalTrip.id) || null);
      }
      setDeleteModalTrip(null);
    } catch (err) {
      console.warn(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicateTrip = async (trip: TripPlan) => {
    try {
      const duplicated = await api.saveTrip({
        ...trip,
        title: `${trip.title} (Copy)`,
      });
      setTrips([duplicated, ...trips]);
      setSelectedTrip(duplicated);
    } catch (err) {
      console.warn('Duplicate failed:', err);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingTrip?.id) return;
    setSavingEdit(true);
    try {
      const updated = await api.updateTrip(editingTrip.id, {
        title: editTitle,
        budget_level: editBudget,
      });
      setTrips(trips.map((t) => (t.id === updated.id ? updated : t)));
      if (selectedTrip?.id === updated.id) {
        setSelectedTrip(updated);
      }
      setEditingTrip(null);
    } catch (err) {
      console.warn(err);
    } finally {
      setSavingEdit(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-2">
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>Personal Itinerary Vault</span>
            </div>
            <h1 className="text-3xl font-extrabold text-charcoal-900 tracking-tight">
              My Saved Trips
            </h1>
            <p className="text-sm text-charcoal-500 mt-1">
              Review, edit, duplicate, and export your road trip itineraries.
            </p>
          </div>

          <Link
            href="/planner"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Plan New Trip</span>
          </Link>
        </div>

        {loading ? (
          <div className="p-16 text-center text-charcoal-500 text-sm">
            <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading your saved trips...
          </div>
        ) : trips.length === 0 ? (
          /* Empty State */
          <div className="bg-white p-12 sm:p-16 rounded-3xl border border-dashed border-slate-300 text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
              <Route className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-charcoal-900 text-xl">You have no saved trips yet</h3>
              <p className="text-sm text-charcoal-500 max-w-md mx-auto">
                Use Google Maps AI to generate a road trip between any two cities, then save it here to access anytime.
              </p>
            </div>
            <Link
              href="/planner"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition"
            >
              <span>Launch AI Planner</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Trips Master-Detail Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Trip List (4 Cols) */}
            <div className="lg:col-span-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal-400">
                Saved Itineraries ({trips.length})
              </span>

              {trips.map((trip) => {
                const isSelected = selectedTrip?.id === trip.id;
                return (
                  <div
                    key={trip.id}
                    onClick={() => setSelectedTrip(trip)}
                    className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white border-brand-600 ring-2 ring-brand-500/20 shadow-md'
                        : 'bg-white/80 border-slate-200/90 hover:bg-white hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-brand-600 mb-1">
                        <span>{trip.total_days} Days ({trip.transport_mode})</span>
                        <span className="text-charcoal-400 font-normal">
                          {trip.created_at ? new Date(trip.created_at).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <h3 className="font-bold text-charcoal-900 text-base">{trip.title}</h3>
                      <p className="text-xs text-charcoal-500 mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-600" />
                        <span>{trip.origin} → {trip.destination}</span>
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-charcoal-500">
                      <span>{trip.route_summary?.distance_km} km distance</span>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleDuplicateTrip(trip)}
                          className="p-1.5 text-charcoal-400 hover:text-brand-600 rounded-lg hover:bg-slate-100"
                          title="Duplicate trip"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModalTrip(trip)}
                          className="p-1.5 text-charcoal-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                          title="Delete trip"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Trip Details View (7 Cols) */}
            {selectedTrip && (
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold">
                        {selectedTrip.total_days} Days / {selectedTrip.budget_level}
                      </span>
                      {selectedTrip.is_demo && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                          Demo Data
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-extrabold text-charcoal-900 tracking-tight">
                      {selectedTrip.title}
                    </h2>
                    <p className="text-xs text-charcoal-500 mt-1">
                      {selectedTrip.origin} to {selectedTrip.destination} • {selectedTrip.travelers} Travelers
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingTrip(selectedTrip);
                        setEditTitle(selectedTrip.title);
                        setEditBudget(selectedTrip.budget_level);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-charcoal-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-brand-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteModalTrip(selectedTrip)}
                      className="px-3 py-1.5 rounded-xl border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-1.5 shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Route Summary Metrics */}
                {selectedTrip.route_summary && (
                  <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-charcoal-400">Total Distance</span>
                      <div className="text-sm font-extrabold text-charcoal-900 mt-0.5">
                        {selectedTrip.route_summary.distance_km} km
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-charcoal-400">Estimated Driving</span>
                      <div className="text-sm font-extrabold text-charcoal-900 mt-0.5">
                        ~{selectedTrip.route_summary.duration_hours} hrs
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-charcoal-400">Toll Information</span>
                      <div className="text-xs font-semibold text-charcoal-700 mt-0.5 truncate">
                        {selectedTrip.route_summary.toll_info || 'Calculated via Routes'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Day-by-Day Itinerary Timeline */}
                <div className="space-y-4">
                  <h3 className="text-base font-extrabold text-charcoal-900">Day-by-Day Itinerary</h3>

                  <div className="space-y-4">
                    {selectedTrip.itinerary.map((day) => (
                      <div
                        key={day.day_number}
                        className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-charcoal-900 text-sm">{day.title}</h4>
                          <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                            {day.stops.length} Stops
                          </span>
                        </div>
                        <p className="text-xs text-charcoal-600">{day.summary}</p>

                        {/* Stops list */}
                        <div className="space-y-2 pt-2 border-t border-slate-200/80">
                          {day.stops.map((stop, sIdx) => (
                            <div
                              key={stop.id || stop.name}
                              className="flex items-start justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200/80 text-xs"
                            >
                              <div className="flex items-start gap-2.5">
                                <div className="w-5 h-5 rounded-full bg-brand-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                  {sIdx + 1}
                                </div>
                                <div>
                                  <div className="font-bold text-charcoal-900">{stop.name}</div>
                                  <div className="text-[11px] text-charcoal-500">{stop.address || stop.category}</div>
                                  {stop.reason && (
                                    <div className="text-[11px] text-charcoal-600 mt-1 italic">
                                      "{stop.reason}"
                                    </div>
                                  )}
                                </div>
                              </div>
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                  stop.name + ' ' + (stop.address || '')
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-brand-600 hover:text-brand-700 shrink-0 font-semibold flex items-center gap-1"
                              >
                                <span>Navigate</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-charcoal-900">Delete this trip?</h3>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-charcoal-900">{deleteModalTrip.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalTrip(null)}
                className="px-4 py-2 text-xs font-semibold text-charcoal-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteTrip}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm"
              >
                {deleting ? 'Deleting...' : 'Delete Trip'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Trip Modal */}
      {editingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-charcoal-900">Edit Trip Details</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">Trip Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">Budget Tier</label>
                <select
                  value={editBudget}
                  onChange={(e) => setEditBudget(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="budget">Budget-Conscious</option>
                  <option value="moderate">Moderate / Balanced</option>
                  <option value="premium">Premium & Luxury</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingTrip(null)}
                className="px-4 py-2 text-xs font-semibold text-charcoal-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingEdit}
                onClick={handleSaveEdit}
                className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm"
              >
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
