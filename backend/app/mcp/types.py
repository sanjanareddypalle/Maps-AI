from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class MCPToolCall(BaseModel):
    name: str
    arguments: Dict[str, Any]

class MCPToolResult(BaseModel):
    tool_name: str
    success: bool
    data: Any
    error: Optional[str] = None
    source: str = "google_maps_mcp"  # "google_maps_mcp" | "google_maps_api" | "verified_demo_data"

class MCPGeocodeResult(BaseModel):
    formatted_address: str
    lat: float
    lng: float
    place_id: str

class MCPDirectionsResult(BaseModel):
    origin: str
    destination: str
    distance_km: float
    duration_hours: float
    duration_text: str
    distance_text: str
    toll_info: Optional[str] = None
    polyline: Optional[str] = None
    coordinates: Optional[List[List[float]]] = None
    steps: List[str] = []
    source: str = "google_maps_mcp"

class MCPPlaceItem(BaseModel):
    place_id: str
    name: str
    category: str
    address: str
    lat: float
    lng: float
    rating: Optional[float] = None
    user_ratings_total: Optional[int] = None
    photo_url: Optional[str] = None
    open_now: Optional[bool] = None
