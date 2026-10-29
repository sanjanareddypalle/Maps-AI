from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class SavedPlaceCreate(BaseModel):
    place_id: str
    name: str
    category: Optional[str] = "attraction"
    address: Optional[str] = ""
    lat: float
    lng: float
    rating: Optional[float] = None
    user_ratings_total: Optional[int] = None
    photo_url: Optional[str] = None
    notes: Optional[str] = None

class SavedPlaceResponse(SavedPlaceCreate):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    created_at: Optional[datetime] = None
