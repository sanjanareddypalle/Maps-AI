import {
  AuthResponse,
  TripPlan,
  UserPreferences,
  LastMileTransferPlan,
  TripFeedback,
  FeedbackAnalysisResponse,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('gm_ai_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      ...this.getHeaders(),
      ...(options.headers as Record<string, string>),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'An unexpected error occurred' }));
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.warn(`API Error on ${endpoint}:`, error.message);
      throw error;
    }
  }

  // Auth endpoints
  async signup(data: { email: string; password: string; full_name: string }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile(): Promise<any> {
    return this.request('/api/auth/me');
  }

  async updateProfile(data: { full_name?: string }): Promise<any> {
    return this.request('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updatePreferences(preferences: UserPreferences): Promise<any> {
    return this.request('/api/user/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // Trip endpoints
  async planTrip(params: {
    origin: string;
    destination: string;
    start_date?: string;
    days?: number;
    travelers?: number;
    mode?: string;
    budget?: string;
    interests?: string[];
    prompt?: string;
  }): Promise<TripPlan> {
    return this.request<TripPlan>('/api/trips/plan', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getTrips(): Promise<TripPlan[]> {
    return this.request<TripPlan[]>('/api/trips');
  }

  async saveTrip(trip: TripPlan): Promise<TripPlan> {
    return this.request<TripPlan>('/api/trips', {
      method: 'POST',
      body: JSON.stringify(trip),
    });
  }

  async getTrip(tripId: string): Promise<TripPlan> {
    return this.request<TripPlan>(`/api/trips/${tripId}`);
  }

  async updateTrip(tripId: string, trip: Partial<TripPlan>): Promise<TripPlan> {
    return this.request<TripPlan>(`/api/trips/${tripId}`, {
      method: 'PUT',
      body: JSON.stringify(trip),
    });
  }

  async deleteTrip(tripId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/trips/${tripId}`, {
      method: 'DELETE',
    });
  }

  // Places & Routes
  async searchPlaces(query: string, category?: string, location?: { lat: number; lng: number }): Promise<any[]> {
    const params = new URLSearchParams({ query });
    if (category) params.append('category', category);
    if (location) {
      params.append('lat', location.lat.toString());
      params.append('lng', location.lng.toString());
    }
    return this.request<any[]>(`/api/places/search?${params.toString()}`);
  }

  async getRoute(
    origin: string,
    destination: string,
    waypoints?: string[],
    avoidTolls?: boolean,
    mode: string = 'driving'
  ): Promise<any> {
    const params = new URLSearchParams({ origin, destination, mode });
    if (waypoints?.length) params.append('waypoints', waypoints.join('|'));
    if (avoidTolls) params.append('avoid_tolls', 'true');
    return this.request<any>(`/api/routes?${params.toString()}`);
  }

  // Transportation & Last-Mile Transfers
  async planLastMileTransfer(data: {
    origin_hub: string;
    destination_place: string;
    hub_type?: string;
    destination_city?: string;
    passengers?: number;
    luggage?: string;
    budget_preference?: string;
    arrival_time?: string;
  }): Promise<LastMileTransferPlan> {
    return this.request<LastMileTransferPlan>('/api/transport/last-mile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTransportHubs(city?: string): Promise<any[]> {
    const params = city ? `?city=${encodeURIComponent(city)}` : '';
    return this.request<any[]>(`/api/transport/hubs${params}`);
  }

  // Reviews, Feedback & Analysis
  async submitFeedback(data: {
    trip_id?: string;
    rating: number;
    written_feedback?: string;
    quick_tags?: string[];
    issues?: string[];
    category_ratings?: Record<string, number>;
    origin?: string;
    destination?: string;
  }): Promise<TripFeedback> {
    return this.request<TripFeedback>('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getFeedback(limit: number = 25): Promise<TripFeedback[]> {
    return this.request<TripFeedback[]>(`/api/feedback?limit=${limit}`);
  }

  async getFeedbackAnalysis(): Promise<FeedbackAnalysisResponse> {
    return this.request<FeedbackAnalysisResponse>('/api/feedback/analysis');
  }
}

export const api = new ApiClient();
