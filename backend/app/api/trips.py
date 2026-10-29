from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from app.database.session import get_db
from app.database.models import User, Trip
from app.schemas.trip import TripPlanRequest, TripSaveRequest, TripResponse
from app.auth.security import get_current_user, get_optional_current_user
from app.agents.travel_agent import travel_agent_service

router = APIRouter(prefix="/trips", tags=["Trips & Itineraries"])

@router.post("/plan")
async def plan_trip(
    req: TripPlanRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Coordinates Google ADK Agent and Google Maps MCP tools to create an intelligent road trip plan.
    Accessible to both authenticated users and guests (with demo / guest session).
    """
    if not req.origin.strip() or not req.destination.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Origin and destination are required to calculate a road trip route.",
        )
    result = await travel_agent_service.plan_trip(req)
    return result

@router.get("", response_model=List[TripResponse])
async def list_trips(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all saved trips owned strictly by the authenticated user."""
    result = await db.execute(
        select(Trip).where(Trip.user_id == current_user.id).order_by(Trip.created_at.desc())
    )
    trips = result.scalars().all()
    return [TripResponse.model_validate(t) for t in trips]

@router.post("", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
async def save_trip(
    trip_in: TripSaveRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Save an itinerary to the user's account."""
    new_trip = Trip(
        user_id=current_user.id,
        title=trip_in.title,
        origin=trip_in.origin,
        destination=trip_in.destination,
        total_days=trip_in.total_days,
        travelers=trip_in.travelers,
        transport_mode=trip_in.transport_mode,
        budget_level=trip_in.budget_level,
        interests=trip_in.interests,
        summary=trip_in.summary,
        route_summary=trip_in.route_summary,
        itinerary=trip_in.itinerary,
        en_route_stops=trip_in.en_route_stops,
        hotel_recommendations=trip_in.hotel_recommendations,
        dining_recommendations=trip_in.dining_recommendations,
        travel_options=trip_in.travel_options,
        budget_breakdown=trip_in.budget_breakdown,
        last_mile_transfers=trip_in.last_mile_transfers,
        is_demo=trip_in.is_demo,
    )
    db.add(new_trip)
    await db.commit()
    await db.refresh(new_trip)
    return TripResponse.model_validate(new_trip)

@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve a single trip owned by the user."""
    result = await db.execute(
        select(Trip).where(Trip.id == trip_id, Trip.user_id == current_user.id)
    )
    trip = result.scalars().first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found or access denied.",
        )
    return TripResponse.model_validate(trip)

@router.put("/{trip_id}", response_model=TripResponse)
async def update_trip(
    trip_id: str,
    trip_in: TripSaveRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing owned trip."""
    result = await db.execute(
        select(Trip).where(Trip.id == trip_id, Trip.user_id == current_user.id)
    )
    trip = result.scalars().first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found or access denied.",
        )

    trip.title = trip_in.title
    trip.origin = trip_in.origin
    trip.destination = trip_in.destination
    trip.total_days = trip_in.total_days
    trip.travelers = trip_in.travelers
    trip.transport_mode = trip_in.transport_mode
    trip.budget_level = trip_in.budget_level
    trip.interests = trip_in.interests
    trip.summary = trip_in.summary
    trip.route_summary = trip_in.route_summary
    trip.itinerary = trip_in.itinerary

    await db.commit()
    await db.refresh(trip)
    return TripResponse.model_validate(trip)

@router.delete("/{trip_id}")
async def delete_trip(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete an owned trip."""
    result = await db.execute(
        select(Trip).where(Trip.id == trip_id, Trip.user_id == current_user.id)
    )
    trip = result.scalars().first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found or access denied.",
        )

    await db.delete(trip)
    await db.commit()
    return {"success": True, "message": "Trip successfully deleted."}
