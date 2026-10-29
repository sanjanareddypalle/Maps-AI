from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class LastMileTransportOption(BaseModel):
    id: str
    mode: str  # cab_app, taxi_prepaid, auto_rickshaw, metro, bus, bike_rental, walking
    title: str
    provider: str
    estimated_fare: str
    fare_numeric_min: float
    fare_numeric_max: float
    is_verified_fare: bool = False
    estimated_duration_mins: int
    duration_text: str
    distance_km: float
    convenience_score: int = Field(ge=1, le=5)  # 1 to 5
    luggage_capacity: str  # "1-2 bags", "Up to 4 large bags", "Backpack only"
    passenger_capacity: int
    availability_notes: str
    booking_link: Optional[str] = None
    route_description: Optional[str] = None

class LastMileTransferPlan(BaseModel):
    hub_type: str  # airport, railway_station, bus_terminal, hotel, attraction
    hub_name: str
    destination_name: str
    hub_location: Dict[str, float]
    destination_location: Dict[str, float]
    distance_km: float
    best_recommendation_id: str
    recommendation_reason: str
    options: List[LastMileTransportOption] = Field(default_factory=list)

class LastMileRequest(BaseModel):
    origin_hub: str
    destination_place: str
    hub_type: Optional[str] = "airport"  # airport, railway, hotel, attraction
    destination_city: Optional[str] = None
    passengers: Optional[int] = 2
    luggage: Optional[str] = "moderate"  # light, moderate, heavy
    budget_preference: Optional[str] = "moderate"  # budget, moderate, premium
    arrival_time: Optional[str] = None
