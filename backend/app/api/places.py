from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from app.database.session import get_db
from app.database.models import User, SavedPlace
from app.schemas.place import SavedPlaceCreate, SavedPlaceResponse
from app.auth.security import get_current_user
from app.mcp.adapter import mcp_adapter

router = APIRouter(prefix="/places", tags=["Places & Discovery"])

@router.get("/search")
async def search_places(
    query: str = Query(..., description="Destination, city, or place search term"),
    category: str = Query("attraction", description="Category: attraction, restaurant, viewpoint, culture, nature"),
):
    """Search for places using Google Maps MCP tool maps_search_places."""
    result = await mcp_adapter.search_places(query=query, category=category)
    return result.data

@router.post("/saved", response_model=SavedPlaceResponse, status_code=status.HTTP_201_CREATED)
async def save_place(
    place_in: SavedPlaceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Save a place to the current user's favorites."""
    # Check if already saved
    existing = await db.execute(
        select(SavedPlace).where(
            SavedPlace.user_id == current_user.id,
            SavedPlace.place_id == place_in.place_id,
        )
    )
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Place already saved to your favorites.",
        )

    saved = SavedPlace(
        user_id=current_user.id,
        place_id=place_in.place_id,
        name=place_in.name,
        category=place_in.category or "attraction",
        address=place_in.address,
        lat=place_in.lat,
        lng=place_in.lng,
        rating=place_in.rating,
        user_ratings_total=place_in.user_ratings_total,
        photo_url=place_in.photo_url,
        notes=place_in.notes,
    )
    db.add(saved)
    await db.commit()
    await db.refresh(saved)
    return SavedPlaceResponse.model_validate(saved)

@router.get("/saved", response_model=List[SavedPlaceResponse])
async def list_saved_places(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all saved places for the current user."""
    result = await db.execute(
        select(SavedPlace).where(SavedPlace.user_id == current_user.id).order_by(SavedPlace.created_at.desc())
    )
    places = result.scalars().all()
    return [SavedPlaceResponse.model_validate(p) for p in places]

@router.delete("/saved/{place_id}")
async def remove_saved_place(
    place_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a place from saved favorites."""
    result = await db.execute(
        select(SavedPlace).where(
            SavedPlace.user_id == current_user.id,
            (SavedPlace.id == place_id) | (SavedPlace.place_id == place_id),
        )
    )
    place = result.scalars().first()
    if not place:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved place not found.",
        )
    await db.delete(place)
    await db.commit()
    return {"success": True, "message": "Place removed from favorites."}
