import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    avatar_url = Column(String(512), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    preference = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    trips = relationship("Trip", back_populates="user", cascade="all, delete-orphan")
    saved_places = relationship("SavedPlace", back_populates="user", cascade="all, delete-orphan")

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    trip_type = Column(String(50), default="historical")
    budget = Column(String(50), default="moderate")
    transportation = Column(String(50), default="driving")
    duration_days = Column(Integer, default=3)
    interests = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="preference")

class Trip(Base):
    __tablename__ = "trips"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    origin = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    total_days = Column(Integer, default=3)
    travelers = Column(Integer, default=2)
    transport_mode = Column(String(50), default="driving")
    budget_level = Column(String(50), default="moderate")
    interests = Column(JSON, default=list)
    summary = Column(Text, nullable=True)
    route_summary = Column(JSON, nullable=True)
    itinerary = Column(JSON, default=list)
    en_route_stops = Column(JSON, default=list, nullable=True)
    hotel_recommendations = Column(JSON, default=list, nullable=True)
    dining_recommendations = Column(JSON, default=list, nullable=True)
    travel_options = Column(JSON, default=list, nullable=True)
    budget_breakdown = Column(JSON, default=list, nullable=True)
    last_mile_transfers = Column(JSON, nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="trips")

class SavedPlace(Base):
    __tablename__ = "saved_places"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    place_id = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(100), default="attraction")
    address = Column(String(512), nullable=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    rating = Column(Float, nullable=True)
    user_ratings_total = Column(Integer, nullable=True)
    photo_url = Column(String(512), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="saved_places")

class TripFeedback(Base):
    __tablename__ = "trip_feedbacks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trip_id = Column(String(36), nullable=True, index=True)
    user_id = Column(String(36), nullable=True, index=True)
    user_name = Column(String(255), nullable=True)
    rating = Column(Integer, nullable=False)  # 1 to 5
    quick_tags = Column(JSON, default=list)  # ["Helpful", "Accurate", "Overpriced", etc.]
    issues = Column(JSON, default=list)  # ["incorrect_route", "unavailable_transport", etc.]
    category_ratings = Column(JSON, default=dict)  # {"route_quality": 5, "transport": 4, "cost_accuracy": 3}
    written_feedback = Column(Text, nullable=True)
    origin = Column(String(255), nullable=True)
    destination = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
