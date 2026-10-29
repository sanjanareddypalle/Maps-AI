from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class PreferencesBase(BaseModel):
    trip_type: Optional[str] = "historical"
    budget: Optional[str] = "moderate"
    transportation: Optional[str] = "driving"
    duration_days: Optional[int] = 3
    interests: Optional[List[str]] = Field(default_factory=list)

class PreferencesCreate(PreferencesBase):
    pass

class PreferencesUpdate(PreferencesBase):
    pass

class PreferencesResponse(PreferencesBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str

class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = None

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    preferences: Optional[PreferencesResponse] = None
