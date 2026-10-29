from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.config import settings

# If DATABASE_URL starts with postgresql://, convert to asyncpg driver if needed
database_url = settings.DATABASE_URL
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

connect_args = {}
if "sqlite" in database_url:
    connect_args["check_same_thread"] = False

engine = create_async_engine(
    database_url,
    echo=False,
    connect_args=connect_args,
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Auto-migrate any new columns for SQLite if existing table didn't have them
        try:
            from sqlalchemy import text
            for col in ['en_route_stops', 'hotel_recommendations', 'dining_recommendations', 'travel_options', 'budget_breakdown', 'last_mile_transfers']:
                try:
                    await conn.execute(text(f"ALTER TABLE trips ADD COLUMN {col} JSON"))
                except Exception:
                    pass
        except Exception:
            pass

    # Seed demo account and baseline data
    from app.database.models import User, UserPreference, Trip
    from app.auth.security import hash_password
    from sqlalchemy.future import select

    async with AsyncSessionLocal() as session:
        res = await session.execute(select(User).where(User.email == "demo@googlemapsai.com"))
        demo_user = res.scalars().first()
        if not demo_user:
            demo_user = User(
                id="demo-user-1234",
                email="demo@googlemapsai.com",
                full_name="Demo Explorer",
                hashed_password=hash_password("TripPlanner2026!"),
            )
            session.add(demo_user)
            await session.flush()

            demo_pref = UserPreference(
                user_id=demo_user.id,
                trip_type="historical",
                budget="moderate",
                transportation="driving",
                duration_days=3,
                interests=["Historical monuments", "Scenic views", "Local authentic cuisine"],
            )
            session.add(demo_pref)

            sample_trip = Trip(
                user_id=demo_user.id,
                title="Hyderabad to Hampi Heritage Trail",
                origin="Hyderabad",
                destination="Hampi",
                total_days=3,
                travelers=2,
                transport_mode="driving",
                budget_level="moderate",
                interests=["Historical monuments", "Scenic views"],
                summary="An optimized 3-day road trip from Hyderabad to Hampi exploring ancient UNESCO World Heritage ruins, Chalukyan temples, and sunset dam views.",
                route_summary={
                    "distance_km": 378.4,
                    "duration_hours": 6.8,
                    "toll_info": "Includes tolls on NH44 and NH67 (~₹320)",
                },
                itinerary=[
                    {
                        "day_number": 1,
                        "title": "Day 1: Departure & Historic En Route Stops",
                        "summary": "Travel from Hyderabad with a stop at Alampur 7th-century temples.",
                        "stops": [
                            {
                                "id": "stop_1",
                                "name": "Alampur Jogulamba Temple",
                                "category": "attraction",
                                "location": {"lat": 15.8778, "lng": 78.1325},
                                "address": "Alampur, Telangana",
                                "rating": 4.7,
                                "user_ratings_total": 6420,
                                "photo_url": "https://images.unsplash.com/photo-1600100397608-f010f443b787?auto=format&fit=crop&w=600&q=80",
                                "reason": "7th-century Chalukyan Badami-style heritage site and Shakti Peetha.",
                                "time_to_spend_minutes": 90,
                                "is_verified": True
                            }
                        ]
                    },
                    {
                        "day_number": 2,
                        "title": "Day 2: Heart of Hampi & Panoramic Views",
                        "summary": "Full day exploring Virupaksha temple, boulder landscapes, and local dining.",
                        "stops": [
                            {
                                "id": "stop_2",
                                "name": "Virupaksha Temple & Hampi Bazaar",
                                "category": "attraction",
                                "location": {"lat": 15.3350, "lng": 76.4600},
                                "address": "Hampi, Karnataka",
                                "rating": 4.8,
                                "user_ratings_total": 32000,
                                "photo_url": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
                                "reason": "Living UNESCO World Heritage 7th-century temple complex.",
                                "time_to_spend_minutes": 120,
                                "is_verified": True
                            }
                        ]
                    },
                    {
                        "day_number": 3,
                        "title": "Day 3: Scenic Excursions & Return Journey",
                        "summary": "Visit Tungabhadra reservoir for views before returning to Hyderabad.",
                        "stops": [
                            {
                                "id": "stop_3",
                                "name": "Tungabhadra Dam & Japanese Garden",
                                "category": "attraction",
                                "location": {"lat": 15.2618, "lng": 76.3392},
                                "address": "Hosapete, Karnataka",
                                "rating": 4.6,
                                "user_ratings_total": 9800,
                                "photo_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
                                "reason": "Golden hour sunset spot overlooking the vast reservoir waters.",
                                "time_to_spend_minutes": 75,
                                "is_verified": True
                            }
                        ]
                    }
                ],
                is_demo=True,
            )
            session.add(sample_trip)
            await session.commit()
