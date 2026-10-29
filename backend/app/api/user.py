from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database.session import get_db
from app.database.models import User, UserPreference
from app.schemas.user import UserUpdate, UserResponse, PreferencesUpdate, PreferencesResponse
from app.auth.security import get_current_user

router = APIRouter(prefix="/user", tags=["User Profile & Preferences"])

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if profile_in.full_name is not None:
        current_user.full_name = profile_in.full_name
    if profile_in.avatar_url is not None:
        current_user.avatar_url = profile_in.avatar_url

    await db.commit()
    await db.refresh(current_user)
    return UserResponse.model_validate(current_user)

@router.get("/preferences", response_model=PreferencesResponse)
async def get_preferences(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(UserPreference).where(UserPreference.user_id == current_user.id))
    pref = result.scalars().first()
    if not pref:
        # Create default if not found
        pref = UserPreference(user_id=current_user.id)
        db.add(pref)
        await db.commit()
        await db.refresh(pref)
    return PreferencesResponse.model_validate(pref)

@router.put("/preferences", response_model=PreferencesResponse)
async def update_preferences(
    pref_in: PreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(UserPreference).where(UserPreference.user_id == current_user.id))
    pref = result.scalars().first()
    if not pref:
        pref = UserPreference(user_id=current_user.id)
        db.add(pref)

    if pref_in.trip_type is not None:
        pref.trip_type = pref_in.trip_type
    if pref_in.budget is not None:
        pref.budget = pref_in.budget
    if pref_in.transportation is not None:
        pref.transportation = pref_in.transportation
    if pref_in.duration_days is not None:
        pref.duration_days = pref_in.duration_days
    if pref_in.interests is not None:
        pref.interests = pref_in.interests

    await db.commit()
    await db.refresh(pref)
    return PreferencesResponse.model_validate(pref)

@router.delete("/account")
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.delete(current_user)
    await db.commit()
    return {"success": True, "message": "User account and all associated data permanently deleted."}
