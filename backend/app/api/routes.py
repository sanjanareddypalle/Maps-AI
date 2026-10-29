from fastapi import APIRouter, Query, HTTPException, status
from app.mcp.adapter import mcp_adapter

router = APIRouter(prefix="/routes", tags=["Routes & Directions"])

@router.get("")
async def get_route(
    origin: str = Query(..., description="Starting location or city"),
    destination: str = Query(..., description="Destination location or city"),
    mode: str = Query("driving", description="Travel mode: driving, transit, bicycling, walking"),
    avoid_tolls: bool = Query(False, description="Whether to avoid toll roads"),
):
    """Retrieve verified route distance, duration, and polyline via Google Maps MCP tool maps_directions."""
    result = await mcp_adapter.get_directions(
        origin=origin,
        destination=destination,
        mode=mode,
        avoid_tolls=avoid_tolls
    )
    return result.data
