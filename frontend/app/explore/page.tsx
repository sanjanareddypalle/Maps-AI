'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import {
  Search,
  MapPin,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Star,
  ExternalLink,
  Filter,
  Compass,
  Navigation,
  Check,
  AlertCircle,
  Clock,
  Layers,
  Map as MapIcon,
  List,
} from 'lucide-react';

function ExploreContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [query, setQuery] = useState(searchParams.get('q') || 'Hampi');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [places, setPlaces] = useState<any[]>([]);
  const [savedPlaceIds, setSavedPlaceIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'attraction', label: 'Attractions & Heritage' },
    { id: 'restaurant', label: 'Food & Dining' },
    { id: 'viewpoint', label: 'Scenic Viewpoints' },
    { id: 'nature', label: 'Nature & Parks' },
  ];

  const handleSearch = async (searchTerm?: string, cat?: string) => {
    setLoading(true);
    setFeedbackMessage(null);
    const q = searchTerm !== undefined ? searchTerm : query;
    const c = cat !== undefined ? cat : selectedCategory;

    try {
      const results = await api.searchPlaces(q, c === 'all' ? undefined : c);
      setPlaces(results);
    } catch (err: any) {
      console.warn('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [selectedCategory]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    setLocationStatus('Requesting location permission...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationStatus(`Located: ${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`);
        handleSearch('Nearby Attractions', selectedCategory);
      },
      (err) => {
        setLocationStatus('Location permission denied. Please enter a destination manually.');
      }
    );
  };

  const handleToggleSave = async (place: any) => {
    if (!user) {
      setFeedbackMessage('Please sign in to save places to your favorites.');
      return;
    }

    const placeId = place.place_id || place.id;
    const isSaved = savedPlaceIds.has(placeId);

    if (isSaved) {
      try {
        await api.request(`/api/places/saved/${placeId}`, { method: 'DELETE' });
        const next = new Set(savedPlaceIds);
        next.delete(placeId);
        setSavedPlaceIds(next);
        setFeedbackMessage('Removed from favorites.');
      } catch (err) {
        console.warn(err);
      }
    } else {
      try {
        await api.request('/api/places/saved', {
          method: 'POST',
          body: JSON.stringify({
            place_id: placeId,
            name: place.name,
            category: place.category,
            address: place.address,
            lat: place.lat,
            lng: place.lng,
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            photo_url: place.photo_url,
          }),
        });
        const next = new Set(savedPlaceIds);
        next.add(placeId);
        setSavedPlaceIds(next);
        setFeedbackMessage('Saved to your favorites!');
      } catch (err) {
        console.warn(err);
      }
    }

    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-2">
              <Compass className="w-3.5 h-3.5 text-brand-600" />
              <span>Google Maps Discovery Engine</span>
            </div>
            <h1 className="text-3xl font-extrabold text-charcoal-900 tracking-tight">
              Explore Destinations & Places
            </h1>
            <p className="text-sm text-charcoal-500 mt-1">
              Find verified historical monuments, scenic highway viewpoints, and top-rated highway dining.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUseMyLocation}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-charcoal-700 hover:bg-slate-50 text-xs font-bold shadow-sm transition"
            >
              <Navigation className="w-3.5 h-3.5 text-brand-600" />
              <span>Use Current Location</span>
            </button>
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-brand-50 text-brand-700' : 'text-charcoal-400'}`}
                title="Grid view"
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-brand-50 text-brand-700' : 'text-charcoal-400'}`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {locationStatus && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5 shrink-0" />
            <span>{locationStatus}</span>
          </div>
        )}

        {feedbackMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Search Bar & Categories */}
        <div className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-center gap-2.5 flex-1 px-3">
              <Search className="w-5 h-5 text-brand-600" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by city, highway, landmark (e.g. Hampi, Goa, Western Ghats, Coorg)..."
                className="w-full bg-transparent text-charcoal-900 text-sm focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition"
            >
              Search Places
            </button>
          </form>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => {
              const selected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    selected
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-charcoal-600 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Grid / List */}
        {loading ? (
          <div className="p-16 text-center text-charcoal-500 text-sm space-y-3">
            <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Searching Google Maps for verified locations...</p>
          </div>
        ) : places.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {places.map((place) => {
              const placeId = place.place_id || place.id;
              const isSaved = savedPlaceIds.has(placeId);

              return (
                <div
                  key={placeId}
                  className={`bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-card transition flex ${
                    viewMode === 'grid' ? 'flex-col' : 'flex-col sm:flex-row'
                  }`}
                >
                  {/* Photo */}
                  <div
                    className={`relative overflow-hidden bg-slate-100 ${
                      viewMode === 'grid' ? 'h-48 w-full' : 'h-48 sm:h-auto sm:w-64 shrink-0'
                    }`}
                  >
                    <img
                      src={
                        place.photo_url ||
                        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={place.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-charcoal-800 uppercase tracking-wider">
                      {place.category || 'Attraction'}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-charcoal-900 text-base leading-snug">
                          {place.name}
                        </h3>
                        {place.rating && (
                          <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded-lg text-xs font-bold shrink-0">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{place.rating}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-charcoal-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
                        <span className="truncate">{place.address}</span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleToggleSave(place)}
                        className={`inline-flex items-center gap-1 font-semibold px-2.5 py-1.5 rounded-lg transition ${
                          isSaved
                            ? 'bg-brand-50 text-brand-700'
                            : 'text-charcoal-600 hover:bg-slate-100'
                        }`}
                      >
                        {isSaved ? <BookmarkCheck className="w-4 h-4 text-brand-600" /> : <Bookmark className="w-4 h-4" />}
                        <span>{isSaved ? 'Saved' : 'Save'}</span>
                      </button>

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          place.name + ' ' + (place.address || '')
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-700"
                      >
                        <span>View on Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-2">
            <Compass className="w-8 h-8 text-charcoal-400 mx-auto" />
            <h4 className="font-bold text-charcoal-900 text-base">No places found for this search</h4>
            <p className="text-xs text-charcoal-500">Try searching for a different destination or highway route.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-charcoal-500">Loading explore destinations...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
