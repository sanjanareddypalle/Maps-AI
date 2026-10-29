from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class LocationPoint(BaseModel):
    lat: float
    lng: float

class PlaceStopSchema(BaseModel):
    id: Optional[str] = None
    name: str
    category: Optional[str] = "attraction"
    location: LocationPoint
    address: Optional[str] = ""
    rating: Optional[float] = None
    user_ratings_total: Optional[int] = None
    photo_url: Optional[str] = None
    reason: Optional[str] = ""
    time_to_spend_minutes: Optional[int] = 60
    is_verified: Optional[bool] = True

class ItineraryDaySchema(BaseModel):
    day_number: int
    date_label: Optional[str] = None
    title: str
    summary: str
    stops: List[PlaceStopSchema] = Field(default_factory=list)

class RouteSummarySchema(BaseModel):
    distance_km: float
    duration_hours: float
    toll_info: Optional[str] = None
    polyline: Optional[str] = None

class TripPlanRequest(BaseModel):
    origin: str
    destination: str
    start_date: Optional[str] = None
    days: Optional[int] = 3
    travelers: Optional[int] = 2
    mode: Optional[str] = "driving"
    budget: Optional[str] = "moderate"
    interests: Optional[List[str]] = Field(default_factory=list)
    prompt: Optional[str] = None
    arrival_hub: Optional[str] = None
    accommodation_name: Optional[str] = None
    luggage: Optional[str] = "moderate"

class TripSaveRequest(BaseModel):
    title: str
    origin: str
    destination: str
    total_days: int
    travelers: int = 2
    transport_mode: str = "driving"
    budget_level: str = "moderate"
    interests: List[str] = Field(default_factory=list)
    summary: Optional[str] = ""
    route_summary: Optional[Dict[str, Any]] = None
    itinerary: List[Dict[str, Any]] = Field(default_factory=list)
    en_route_stops: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    hotel_recommendations: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    dining_recommendations: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    travel_options: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    budget_breakdown: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    last_mile_transfers: Optional[Dict[str, Any]] = None
    is_demo: bool = False

class TripResponse(TripSaveRequest):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
