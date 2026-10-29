from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional, List, Dict, Any
from app.schemas.transport import LastMileRequest, LastMileTransferPlan
from app.services.last_mile_transport import last_mile_service, HUB_REGISTRY

router = APIRouter(prefix="/transport", tags=["Transportation & Transfers"])

@router.post("/last-mile", response_model=LastMileTransferPlan)
async def plan_last_mile_transfer(req: LastMileRequest):
    """
    Computes complete last-mile transportation options between arrival hub (airport/railway/bus)
    and accommodation or destination with fare estimates, durations, and booking links.
    """
    if not req.origin_hub.strip() and not req.destination_place.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Origin hub and destination place cannot both be empty."
        )

    try:
        transfer_plan = last_mile_service.build_transfer_plan(
            origin_hub_name=req.origin_hub,
            destination_name=req.destination_place,
            hub_type=req.hub_type or "airport",
            destination_city=req.destination_city,
            passengers=req.passengers or 2,
            luggage=req.luggage or "moderate",
            budget_preference=req.budget_preference or "moderate",
            arrival_time=req.arrival_time,
        )
        return transfer_plan
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate transfer plan: {str(e)}"
        )

@router.get("/hubs")
async def list_available_hubs(city: Optional[str] = None):
    """Returns curated arrival hubs (airports and railway stations)."""
    hubs = []
    for key, hub in HUB_REGISTRY.items():
        if not city or city.lower() in hub["city"].lower():
            hubs.append({
                "id": key,
                "name": hub["name"],
                "type": hub["type"],
                "city": hub["city"],
                "lat": hub["lat"],
                "lng": hub["lng"],
            })
    return hubs
