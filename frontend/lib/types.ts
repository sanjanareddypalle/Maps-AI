export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at?: string;
}

export interface UserPreferences {
  trip_type: 'adventure' | 'nature' | 'historical' | 'family' | 'food' | 'relaxation';
  budget: 'budget' | 'moderate' | 'premium';
  transportation: 'driving' | 'transit' | 'walking' | 'bicycling';
  duration_days: number;
  interests: string[];
}

export interface PlaceStop {
  id: string;
  name: string;
  category: 'attraction' | 'restaurant' | 'viewpoint' | 'hotel' | 'culture' | 'nature';
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  rating?: number;
  user_ratings_total?: number;
  photo_url?: string;
  reason?: string;
  time_to_spend_minutes?: number;
  is_verified?: boolean;
  booking_url?: string;
}

export interface ItineraryDay {
  day_number: number;
  date_label?: string;
  title: string;
  summary: string;
  stops: PlaceStop[];
}

export interface HotelRecommendation {
  id: string;
  name: string;
  tier: 'budget' | 'moderate' | 'luxury';
  price_per_night: string;
  rating: number;
  reviews_count?: number;
  amenities: string[];
  photo_url: string;
  address: string;
  booking_url?: string;
}

export interface DiningRecommendation {
  id: string;
  name: string;
  cuisine: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'all-day';
  price_range: string;
  rating: number;
  specialty_dish: string;
  address: string;
  photo_url: string;
  booking_url?: string;
}

export interface TravelOption {
  mode: 'road' | 'train' | 'flight';
  title: string;
  duration_text: string;
  distance_or_transit: string;
  estimated_cost: string;
  details: string;
  highlights: string[];
  booking_url?: string;
}

export interface BudgetTierBreakdown {
  tier: 'budget' | 'moderate' | 'luxury';
  title: string;
  total_estimated: string;
  stay_cost: string;
  food_cost: string;
  transport_cost: string;
  activities_cost: string;
  description: string;
}

export interface LastMileTransportOption {
  id: string;
  mode: 'cab_app' | 'taxi_prepaid' | 'auto_rickshaw' | 'metro' | 'bus' | 'bike_rental' | string;
  title: string;
  provider: string;
  estimated_fare: string;
  fare_numeric_min: number;
  fare_numeric_max: number;
  is_verified_fare: boolean;
  estimated_duration_mins: number;
  duration_text: string;
  distance_km: number;
  convenience_score: number;
  luggage_capacity: string;
  passenger_capacity: number;
  availability_notes: string;
  booking_link?: string;
  route_description?: string;
}

export interface LastMileTransferPlan {
  hub_type: 'airport' | 'railway_station' | 'bus_terminal' | 'hotel' | 'attraction' | string;
  hub_name: string;
  destination_name: string;
  hub_location: { lat: number; lng: number };
  destination_location: { lat: number; lng: number };
  distance_km: number;
  best_recommendation_id: string;
  recommendation_reason: string;
  options: LastMileTransportOption[];
}

export interface TripFeedback {
  id: string;
  trip_id?: string;
  user_id?: string;
  user_name?: string;
  rating: number;
  written_feedback?: string;
  quick_tags: string[];
  issues: string[];
  category_ratings: Record<string, number>;
  origin?: string;
  destination?: string;
  created_at?: string;
}

export interface RecurringIssueItem {
  issue_code: string;
  label: string;
  count: number;
  percentage: number;
  impact_level: 'high' | 'medium' | 'low' | string;
  remedy_action: string;
}

export interface FeedbackAnalysisResponse {
  total_reviews: number;
  average_overall_rating: number;
  rating_breakdown: Record<number, number>;
  category_averages: Record<string, number>;
  recurring_issues: RecurringIssueItem[];
  top_positive_highlights: string[];
  ai_improvement_summary: string;
  actionable_recommendations: string[];
}

export interface TripPlan {
  id?: string;
  title: string;
  origin: string;
  destination: string;
  start_date?: string;
  end_date?: string;
  total_days: number;
  travelers: number;
  transport_mode: string;
  budget_level: string;
  interests: string[];
  summary: string;
  route_summary?: {
    distance_km: number;
    duration_hours: number;
    toll_info?: string;
    polyline?: string;
  };
  itinerary: ItineraryDay[];
  en_route_stops?: PlaceStop[];
  hotel_recommendations?: HotelRecommendation[];
  dining_recommendations?: DiningRecommendation[];
  travel_options?: TravelOption[];
  budget_breakdown?: BudgetTierBreakdown[];
  last_mile_transfers?: LastMileTransferPlan;
  created_at?: string;
  is_demo?: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
  preferences?: UserPreferences | null;
}
