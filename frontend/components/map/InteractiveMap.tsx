'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PlaceStop } from '@/lib/types';
import { api } from '@/lib/api';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ExternalLink,
  MapPin,
  Navigation,
  Compass,
  Car,
  Footprints,
  Bike,
  Train,
  RotateCcw,
  Search,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
} from 'lucide-react';

interface InteractiveMapProps {
  origin?: string;
  destination?: string;
  stops?: PlaceStop[];
  selectedStop?: PlaceStop | null;
  onSelectStop?: (stop: PlaceStop) => void;
  isDemo?: boolean;
}

const TILE_PROVIDERS = {
  map: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
  },
};

interface CurrentLocationRoute {
  originLabel: string;
  destinationLabel: string;
  mode: 'driving' | 'transit' | 'walking' | 'bicycling';
  distance_km: number;
  duration_text: string;
  toll_info?: string;
  steps: string[];
  coordinates?: [number, number][];
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  origin,
  destination,
  stops = [],
  selectedStop,
  onSelectStop,
}) => {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const currentRoutePolylineRef = useRef<any>(null);

  const [activeLayer, setActiveLayer] = useState<'map' | 'terrain' | 'satellite'>('map');
  const [mapReady, setMapReady] = useState(false);

  // Current Location & Routing State (Feature 3)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [manualOrigin, setManualOrigin] = useState('');
  const [searchDest, setSearchDest] = useState('');
  const [travelMode, setTravelMode] = useState<'driving' | 'transit' | 'walking' | 'bicycling'>('driving');
  const [activeRoute, setActiveRoute] = useState<CurrentLocationRoute | null>(null);
  const [routingLoading, setRoutingLoading] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapElementRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }

      const defaultCenter: [number, number] = stops.length > 0
        ? [stops[0].location.lat, stops[0].location.lng]
        : [17.4399, 78.3800]; // Default vibrant center

      const map = L.map(mapElementRef.current!, {
        center: defaultCenter,
        zoom: 8,
        zoomControl: false,
        attributionControl: false,
      });

      const initialTile = L.tileLayer(TILE_PROVIDERS.map.url, {
        maxZoom: 19,
        attribution: TILE_PROVIDERS.map.attribution,
      }).addTo(map);

      tileLayerRef.current = initialTile;
      leafletMapRef.current = map;

      if (isMounted) {
        setMapReady(true);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Switch Tile Layer
  useEffect(() => {
    if (!leafletMapRef.current || !mapReady) return;

    const changeTile = async () => {
      const L = (await import('leaflet')).default;
      if (tileLayerRef.current) {
        leafletMapRef.current.removeLayer(tileLayerRef.current);
      }
      const provider = TILE_PROVIDERS[activeLayer];
      const newTile = L.tileLayer(provider.url, {
        maxZoom: 19,
        attribution: provider.attribution,
      }).addTo(leafletMapRef.current);
      tileLayerRef.current = newTile;
    };

    changeTile();
  }, [activeLayer, mapReady]);

  // Request Browser Geolocation
  const handleRequestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationLoading(false);
        setShowLocationDialog(false);

        if (leafletMapRef.current) {
          const L = (await import('leaflet')).default;
          if (userMarkerRef.current) {
            userMarkerRef.current.remove();
          }

          const userIconHtml = `
            <div style="
              position: relative;
              width: 36px;
              height: 36px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #2563eb;
              color: white;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 0 16px rgba(37,99,235,0.6);
            ">
              <div style="
                position: absolute;
                inset: -6px;
                border-radius: 50%;
                border: 2px solid #3b82f6;
                animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
              "></div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
              </svg>
            </div>
          `;

          const userIcon = L.divIcon({
            className: 'user-location-pin',
            html: userIconHtml,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          });

          const uMarker = L.marker([latitude, longitude], { icon: userIcon }).addTo(leafletMapRef.current);
          uMarker.bindPopup(`
            <div style="font-family: system-ui, sans-serif; font-size: 12px; padding: 4px;">
              <strong style="color: #2563eb;">📍 Your Current Location</strong>
              <div style="color: #64748b; font-size: 11px; margin-top: 2px;">${latitude.toFixed(4)}, ${longitude.toFixed(4)}</div>
            </div>
          `);
          userMarkerRef.current = uMarker;

          leafletMapRef.current.setView([latitude, longitude], 12);
        }
      },
      (err) => {
        setLocationLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Location permission was denied. You can enter your starting location manually.');
        } else {
          setLocationError('Unable to retrieve location. Please type your starting point.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  // Calculate Route from Current/Manual Location to Searched Destination
  const handleCalculateRoute = useCallback(
    async (destTarget?: string, modeOverride?: 'driving' | 'transit' | 'walking' | 'bicycling') => {
      const targetDest = destTarget || searchDest || destination;
      if (!targetDest) {
        setLocationError('Please select or enter a destination to plot route.');
        return;
      }

      const activeMode = modeOverride || travelMode;
      const originStr = userLocation
        ? `${userLocation.lat},${userLocation.lng}`
        : manualOrigin.trim() || origin || 'Hyderabad';

      setRoutingLoading(true);
      setLocationError(null);

      try {
        const routeData = await api.getRoute(originStr, targetDest, undefined, false, activeMode);
        const L = (await import('leaflet')).default;
        const map = leafletMapRef.current;

        if (currentRoutePolylineRef.current) {
          currentRoutePolylineRef.current.remove();
          currentRoutePolylineRef.current = null;
        }

        const coords: [number, number][] = routeData.coordinates || [];

        if (coords.length > 0 && map) {
          const modeColors: Record<string, string> = {
            driving: '#2563eb',
            transit: '#059669',
            walking: '#7c3aed',
            bicycling: '#d97706',
          };
          const strokeColor = modeColors[activeMode] || '#2563eb';

          const poly = L.polyline(coords, {
            color: strokeColor,
            weight: 5,
            opacity: 0.9,
            dashArray: activeMode === 'walking' ? '4, 8' : undefined,
          }).addTo(map);

          currentRoutePolylineRef.current = poly;
          map.fitBounds(poly.getBounds(), { padding: [60, 60] });
        }

        setActiveRoute({
          originLabel: userLocation ? 'My Current Location' : originStr,
          destinationLabel: targetDest,
          mode: activeMode,
          distance_km: routeData.distance_km || 12.5,
          duration_text: routeData.duration_text || '25 mins',
          toll_info: routeData.toll_info,
          steps: routeData.steps || [],
          coordinates: coords,
        });
      } catch (err: any) {
        setLocationError(err.message || 'Could not calculate route to destination.');
      } finally {
        setRoutingLoading(false);
      }
    },
    [userLocation, manualOrigin, searchDest, destination, origin, travelMode]
  );

  // Update Itinerary Waypoints & Baseline Route
  useEffect(() => {
    if (!leafletMapRef.current || !mapReady) return;

    const updateMapElements = async () => {
      const L = (await import('leaflet')).default;
      const map = leafletMapRef.current;

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }

      if (stops.length === 0) return;

      const latLngs: [number, number][] = [];

      stops.forEach((stop, index) => {
        const lat = stop.location.lat;
        const lng = stop.location.lng;
        latLngs.push([lat, lng]);

        const isSelected = selectedStop?.id === stop.id || selectedStop?.name === stop.name;

        const iconHtml = `
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${isSelected ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)'};
            color: #ffffff;
            font-weight: 800;
            font-size: 13px;
            border-radius: 50%;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: transform 0.2s;
            transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
          ">
            <span>${index + 1}</span>
            <div style="
              position: absolute;
              bottom: -4px;
              left: 50%;
              transform: translateX(-50%);
              width: 0;
              height: 0;
              border-left: 4px solid transparent;
              border-right: 4px solid transparent;
              border-top: 4px solid ${isSelected ? '#d97706' : '#1d4ed8'};
            "></div>
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'custom-map-pin',
          html: iconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -30],
        });

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; min-width: 200px; max-width: 260px;">
            ${stop.photo_url ? `
              <img src="${stop.photo_url}" alt="${stop.name}" style="width: 100%; height: 105px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
            ` : ''}
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #2563eb; background: #eff6ff; padding: 2px 6px; border-radius: 4px;">
                ${stop.category || 'Attraction'}
              </span>
              <span style="font-size: 11px; font-weight: 700; color: #d97706;">★ ${stop.rating || '4.7'}</span>
            </div>
            <strong style="font-size: 13px; color: #0f172a; display: block; line-height: 1.3;">${stop.name}</strong>
            <p style="font-size: 11px; color: #64748b; margin: 4px 0 8px 0; line-height: 1.3;">
              ${stop.reason || stop.address || ''}
            </p>
            <div style="border-top: 1px solid #f1f5f9; padding-top: 6px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 10px; color: #94a3b8;">Est. ${stop.time_to_spend_minutes || 60} mins</span>
              <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.name + ' ' + (stop.address || ''))}" target="_blank" rel="noopener noreferrer" style="font-size: 11px; color: #2563eb; font-weight: 600; text-decoration: none;">
                Navigate &rarr;
              </a>
            </div>
          </div>
        `;

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(popupContent, { maxWidth: 280, closeButton: false });

        marker.on('click', () => {
          onSelectStop?.(stop);
          // Quick trigger routing from current location to this stop!
          setSearchDest(stop.name);
        });

        if (isSelected) {
          marker.openPopup();
        }

        markersRef.current.push(marker);
      });

      if (latLngs.length > 1 && !currentRoutePolylineRef.current) {
        const polyline = L.polyline(latLngs, {
          color: '#2563eb',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 8',
          lineCap: 'round',
        }).addTo(map);

        polylineRef.current = polyline;

        map.fitBounds(polyline.getBounds(), {
          padding: [50, 50],
          maxZoom: 13,
        });
      } else if (latLngs.length === 1) {
        map.setView(latLngs[0], 11);
      }
    };

    updateMapElements();
  }, [stops, selectedStop, mapReady]);

  const handleZoomIn = () => leafletMapRef.current?.zoomIn();
  const handleZoomOut = () => leafletMapRef.current?.zoomOut();

  const handleFitBounds = () => {
    if (!leafletMapRef.current) return;
    if (currentRoutePolylineRef.current) {
      leafletMapRef.current.fitBounds(currentRoutePolylineRef.current.getBounds(), { padding: [50, 50] });
      return;
    }
    if (stops.length > 0) {
      const latLngs = stops.map((s) => [s.location.lat, s.location.lng]);
      const L = (window as any).L;
      if (L) {
        leafletMapRef.current.fitBounds(L.latLngBounds(latLngs), { padding: [50, 50] });
      }
    }
  };

  return (
    <div className="relative w-full h-full min-h-[440px] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner flex flex-col justify-between">
      <div ref={mapElementRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between pointer-events-none">
        {/* Left: Route Corridor Badge & Use Location Button */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-charcoal-800">
              {origin && destination ? `${origin} → ${destination}` : 'Interactive Route View'}
            </span>
            <span className="text-charcoal-300">|</span>
            <span className="text-brand-600 font-semibold">{stops.length} Waypoints</span>
          </div>

          {/* Use My Current Location Pill */}
          <button
            onClick={() => setShowLocationDialog(true)}
            disabled={locationLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl shadow-md border text-xs font-bold transition hover:scale-102 ${
              userLocation
                ? 'bg-blue-600 text-white border-blue-700 shadow-blue-500/20'
                : 'bg-white/95 text-charcoal-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Route from your GPS coordinates"
          >
            <Compass className={`w-3.5 h-3.5 ${locationLoading ? 'animate-spin' : userLocation ? 'text-white' : 'text-blue-600'}`} />
            <span>{userLocation ? 'GPS Location Active' : 'Use My Current Location'}</span>
          </button>
        </div>

        {/* Right: Map Layer Switcher */}
        <div className="pointer-events-auto flex items-center bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-200 text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveLayer('map')}
            className={`px-2.5 py-1 rounded-lg transition ${
              activeLayer === 'map' ? 'bg-brand-600 text-white' : 'text-charcoal-600 hover:bg-slate-100'
            }`}
          >
            Map
          </button>
          <button
            onClick={() => setActiveLayer('terrain')}
            className={`px-2.5 py-1 rounded-lg transition ${
              activeLayer === 'terrain' ? 'bg-brand-600 text-white' : 'text-charcoal-600 hover:bg-slate-100'
            }`}
          >
            Terrain
          </button>
          <button
            onClick={() => setActiveLayer('satellite')}
            className={`px-2.5 py-1 rounded-lg transition ${
              activeLayer === 'satellite' ? 'bg-brand-600 text-white' : 'text-charcoal-600 hover:bg-slate-100'
            }`}
          >
            Satellite
          </button>
        </div>
      </div>

      {/* Geolocation Explanation Dialog Modal */}
      {showLocationDialog && (
        <div className="absolute inset-0 z-30 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                <Compass className="w-4 h-4" />
                <span>Enable Real-Time Route Navigation</span>
              </div>
              <button
                onClick={() => setShowLocationDialog(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-charcoal-600 leading-relaxed">
              We request your location to calculate real driving, walking, cycling, or transit routes from where you are directly to your hotel, restaurant, or tourist attraction.
            </p>

            {locationError && (
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                <span>{locationError}</span>
              </div>
            )}

            <div className="space-y-1.5 pt-1">
              <button
                onClick={handleRequestLocation}
                disabled={locationLoading}
                className="w-full py-2 px-3 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{locationLoading ? 'Locating Your Position...' : 'Allow GPS Location Access'}</span>
              </button>

              <div className="relative my-2 text-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <span className="relative bg-white px-2 text-[10px] text-charcoal-400 font-semibold uppercase">Or enter origin manually</span>
              </div>

              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="e.g. Gachibowli, Hyderabad"
                  value={manualOrigin}
                  onChange={(e) => setManualOrigin(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                />
                <button
                  onClick={() => {
                    if (manualOrigin.trim()) {
                      setShowLocationDialog(false);
                      handleCalculateRoute();
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 shrink-0"
                >
                  Set
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Destination Quick Search & Mode Switcher Bar */}
      <div className="absolute top-16 left-3 right-3 sm:right-auto z-20 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-slate-200/90 flex flex-col sm:flex-row gap-1.5 max-w-lg">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search destination, hotel, attraction..."
              value={searchDest}
              onChange={(e) => setSearchDest(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCalculateRoute()}
              className="bg-transparent text-charcoal-800 placeholder-charcoal-400 outline-none w-full text-xs font-medium"
            />
            {searchDest && (
              <button onClick={() => setSearchDest('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1 shrink-0 bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[11px]">
            <button
              onClick={() => {
                setTravelMode('driving');
                if (activeRoute) handleCalculateRoute(undefined, 'driving');
              }}
              className={`p-1.5 rounded-lg transition ${
                travelMode === 'driving' ? 'bg-blue-600 text-white shadow-sm' : 'text-charcoal-600 hover:bg-white'
              }`}
              title="Driving (Car)"
            >
              <Car className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setTravelMode('transit');
                if (activeRoute) handleCalculateRoute(undefined, 'transit');
              }}
              className={`p-1.5 rounded-lg transition ${
                travelMode === 'transit' ? 'bg-emerald-600 text-white shadow-sm' : 'text-charcoal-600 hover:bg-white'
              }`}
              title="Public Transit (Metro / Bus)"
            >
              <Train className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setTravelMode('bicycling');
                if (activeRoute) handleCalculateRoute(undefined, 'bicycling');
              }}
              className={`p-1.5 rounded-lg transition ${
                travelMode === 'bicycling' ? 'bg-amber-600 text-white shadow-sm' : 'text-charcoal-600 hover:bg-white'
              }`}
              title="Bicycling"
            >
              <Bike className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setTravelMode('walking');
                if (activeRoute) handleCalculateRoute(undefined, 'walking');
              }}
              className={`p-1.5 rounded-lg transition ${
                travelMode === 'walking' ? 'bg-purple-600 text-white shadow-sm' : 'text-charcoal-600 hover:bg-white'
              }`}
              title="Walking"
            >
              <Footprints className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleCalculateRoute()}
              disabled={routingLoading}
              className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition flex items-center gap-1 shadow-sm"
            >
              <Navigation className={`w-3 h-3 ${routingLoading ? 'animate-spin' : ''}`} />
              <span>Route</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Active Route Statistics Card */}
      {activeRoute && (
        <div className="absolute bottom-4 left-3 right-3 sm:right-auto z-20 pointer-events-auto max-w-sm w-full">
          <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span className="font-bold text-charcoal-900 truncate max-w-[190px]">
                  {activeRoute.originLabel} ➔ {activeRoute.destinationLabel}
                </span>
              </div>
              <button
                onClick={() => {
                  if (currentRoutePolylineRef.current) {
                    currentRoutePolylineRef.current.remove();
                    currentRoutePolylineRef.current = null;
                  }
                  setActiveRoute(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                title="Clear current route"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div className="bg-blue-50/70 p-1.5 rounded-xl border border-blue-100">
                <div className="text-[10px] text-blue-600 font-semibold uppercase">Est. Travel Time</div>
                <div className="text-sm font-extrabold text-blue-900">{activeRoute.duration_text}</div>
              </div>
              <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                <div className="text-[10px] text-charcoal-500 font-semibold uppercase">Total Distance</div>
                <div className="text-sm font-extrabold text-charcoal-900">{activeRoute.distance_km} km</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-charcoal-600 pt-0.5">
              <span className="capitalize font-medium text-slate-500">Mode: {activeRoute.mode}</span>
              {activeRoute.steps?.length > 0 && (
                <button
                  onClick={() => setShowSteps(!showSteps)}
                  className="font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                >
                  <span>{showSteps ? 'Hide Steps' : `${activeRoute.steps.length} Steps`}</span>
                  {showSteps ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </div>

            {showSteps && activeRoute.steps?.length > 0 && (
              <div className="max-h-28 overflow-y-auto space-y-1 pt-1 border-t border-slate-100 text-[11px] pr-1">
                {activeRoute.steps.map((st, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-charcoal-700">
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-tight">{st}</span>
                  </div>
                ))}
              </div>
            )}

            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(activeRoute.originLabel)}&destination=${encodeURIComponent(activeRoute.destinationLabel)}&travelmode=${activeRoute.mode}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1 hover:bg-blue-700 transition shadow-sm"
            >
              <span>Open in Google Maps Navigation</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Bottom Right Zoom & Fit Controls */}
      <div className="absolute bottom-5 right-4 z-20 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-xl bg-white/95 backdrop-blur-md text-charcoal-700 hover:bg-slate-50 border border-slate-200 shadow-md transition hover:scale-105"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-xl bg-white/95 backdrop-blur-md text-charcoal-700 hover:bg-slate-50 border border-slate-200 shadow-md transition hover:scale-105"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFitBounds}
          className="p-2 rounded-xl bg-white/95 backdrop-blur-md text-charcoal-700 hover:bg-slate-50 border border-slate-200 shadow-md transition hover:scale-105"
          title="Fit route"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
