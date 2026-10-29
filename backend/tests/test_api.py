import uuid
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database.session import init_db

@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    await init_db()
    yield

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "Google Maps AI" in data["service"]

@pytest.mark.asyncio
async def test_auth_flow():
    test_email = f"traveler_{uuid.uuid4().hex[:8]}@example.com"
    test_password = "SecretPassword123!"

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Signup
        signup_res = await ac.post("/api/auth/signup", json={
            "email": test_email,
            "password": test_password,
            "full_name": "Test Explorer"
        })
        assert signup_res.status_code == 201
        data = signup_res.json()
        assert "access_token" in data
        assert data["user"]["email"] == test_email
        token = data["access_token"]

        # Duplicate email prevention
        dup_res = await ac.post("/api/auth/signup", json={
            "email": test_email,
            "password": test_password,
            "full_name": "Test Explorer"
        })
        assert dup_res.status_code == 400

        # Login
        login_res = await ac.post("/api/auth/login", json={
            "email": test_email,
            "password": test_password
        })
        assert login_res.status_code == 200
        assert "access_token" in login_res.json()

        # Invalid login
        bad_res = await ac.post("/api/auth/login", json={
            "email": test_email,
            "password": "WrongPassword!"
        })
        assert bad_res.status_code == 401

        # Profile / Preferences
        headers = {"Authorization": f"Bearer {token}"}
        pref_res = await ac.get("/api/user/preferences", headers=headers)
        assert pref_res.status_code == 200
        assert pref_res.json()["trip_type"] == "historical"

@pytest.mark.asyncio
async def test_trip_planning_and_saving():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Plan trip with Google ADK / MCP
        plan_res = await ac.post("/api/trips/plan", json={
            "origin": "Hyderabad",
            "destination": "Hampi",
            "days": 3,
            "budget": "moderate",
            "interests": ["Historical monuments", "Scenic views"]
        })
        assert plan_res.status_code == 200
        plan = plan_res.json()
        assert "route_summary" in plan
        assert plan["route_summary"]["distance_km"] > 0
        assert len(plan["itinerary"]) == 3
        assert len(plan["itinerary"][0]["stops"]) > 0

        # 2. Register user & save planned trip
        user_email = f"planner_{uuid.uuid4().hex[:8]}@example.com"
        signup_res = await ac.post("/api/auth/signup", json={
            "email": user_email,
            "password": "Password789!",
            "full_name": "Trip Planner User"
        })
        assert signup_res.status_code == 201
        token = signup_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Save trip
        save_res = await ac.post("/api/trips", json={
            "title": plan["title"],
            "origin": plan["origin"],
            "destination": plan["destination"],
            "total_days": plan["total_days"],
            "travelers": 2,
            "transport_mode": "driving",
            "budget_level": "moderate",
            "interests": plan["interests"],
            "summary": plan["summary"],
            "route_summary": plan["route_summary"],
            "itinerary": plan["itinerary"],
            "is_demo": plan["is_demo"]
        }, headers=headers)
        assert save_res.status_code == 201
        saved_trip = save_res.json()
        trip_id = saved_trip["id"]

        # List trips
        list_res = await ac.get("/api/trips", headers=headers)
        assert list_res.status_code == 200
        assert len(list_res.json()) >= 1

        # Delete trip
        del_res = await ac.delete(f"/api/trips/{trip_id}", headers=headers)
        assert del_res.status_code == 200

@pytest.mark.asyncio
async def test_places_and_routes_api():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Places search
        places_res = await ac.get("/api/places/search?query=Hampi&category=attraction")
        assert places_res.status_code == 200
        places = places_res.json()
        assert len(places) > 0

        # Routes calculation
        routes_res = await ac.get("/api/routes?origin=Hyderabad&destination=Hampi")
        assert routes_res.status_code == 200
        route_data = routes_res.json()
        assert route_data["distance_km"] > 0
        assert route_data["duration_hours"] > 0
