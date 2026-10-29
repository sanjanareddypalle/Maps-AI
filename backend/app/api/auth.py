from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database.session import get_db
from app.database.models import User, UserPreference
from app.schemas.user import UserCreate, UserLogin, AuthResponse, UserResponse, PreferencesResponse
from app.auth.security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == user_in.email.lower()))
    existing = result.scalars().first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    # Hash password securely
    hashed_pwd = hash_password(user_in.password)

    new_user = User(
        email=user_in.email.lower(),
        full_name=user_in.full_name,
        hashed_password=hashed_pwd,
    )
    db.add(new_user)
    await db.flush()

    # Create initial default preferences
    pref = UserPreference(
        user_id=new_user.id,
        trip_type="historical",
        budget="moderate",
        transportation="driving",
        duration_days=3,
        interests=["Scenic views", "Historical monuments", "Local authentic cuisine"],
    )
    db.add(pref)
    await db.commit()
    await db.refresh(new_user)
    await db.refresh(pref)

    access_token = create_access_token(data={"sub": new_user.id, "email": new_user.email})

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user),
        preferences=PreferencesResponse.model_validate(pref),
    )

@router.post("/login", response_model=AuthResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == credentials.email.lower()))
    user = result.scalars().first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password. Please verify your credentials.",
        )

    # Fetch preferences
    pref_res = await db.execute(select(UserPreference).where(UserPreference.user_id == user.id))
    pref = pref_res.scalars().first()

    access_token = create_access_token(data={"sub": user.id, "email": user.email})

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
        preferences=PreferencesResponse.model_validate(pref) if pref else None,
    )

@router.get("/me")
async def get_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    pref_res = await db.execute(select(UserPreference).where(UserPreference.user_id == current_user.id))
    pref = pref_res.scalars().first()

    return {
        "user": UserResponse.model_validate(current_user),
        "preferences": PreferencesResponse.model_validate(pref) if pref else None,
    }
