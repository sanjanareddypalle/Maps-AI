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
async def test_last_mile_transport_planning():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        req_payload = {
            "origin_hub": "Manohar International Airport (Mopa - GOX), North Goa",
            "destination_place": "Taj Fort Aguada Resort, Sinquerim, North Goa",
            "hub_type": "airport",
            "destination_city": "Goa",
            "passengers": 2,
            "luggage": "moderate",
            "budget_preference": "moderate"
        }
        res = await ac.post("/api/transport/last-mile", json=req_payload)
        assert res.status_code == 200
        data = res.json()
        assert "options" in data
        assert len(data["options"]) >= 3
        modes = [opt["mode"] for opt in data["options"]]
        assert "cab_app" in modes
        assert "taxi_prepaid" in modes
        assert "bus" in modes
        # In Goa, bike rental should also be available
        assert "bike_rental" in modes
        # Check fare transparency
        for opt in data["options"]:
            assert "estimated_fare" in opt
            assert "duration_text" in opt
            assert "convenience_score" in opt
            assert "luggage_capacity" in opt
            assert "booking_link" in opt
            assert isinstance(opt["is_verified_fare"], bool)

@pytest.mark.asyncio
async def test_transport_hubs():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/transport/hubs")
        assert res.status_code == 200
        hubs = res.json()
        assert len(hubs) >= 5
        hub_cities = [h["city"].lower() for h in hubs]
        assert any("goa" in c for c in hub_cities)
        assert any("bengaluru" in c or "bangalore" in c for c in hub_cities)

@pytest.mark.asyncio
async def test_feedback_flow_and_analysis():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Submit feedback
        fb_payload = {
            "rating": 5,
            "written_feedback": "Airport transfer recommendations were spot-on! The bus shuttle saved money.",
            "quick_tags": ["Helpful", "Accurate", "Smooth Transfer"],
            "issues": [],
            "category_ratings": {
                "route_quality": 5,
                "transport": 5,
                "cost_accuracy": 4,
                "recommendations": 5
            },
            "origin": "Bangalore",
            "destination": "Goa"
        }
        create_res = await ac.post("/api/feedback", json=fb_payload)
        assert create_res.status_code == 201
        fb_data = create_res.json()
        assert fb_data["rating"] == 5
        assert fb_data["user_name"] == "Traveler"
        assert "Smooth Transfer" in fb_data["quick_tags"]

        # 2. List feedback
        list_res = await ac.get("/api/feedback")
        assert list_res.status_code == 200
        reviews = list_res.json()
        assert len(reviews) >= 1

        # 3. Retrieve analysis
        analysis_res = await ac.get("/api/feedback/analysis")
        assert analysis_res.status_code == 200
        analysis = analysis_res.json()
        assert analysis["total_reviews"] >= 1
        assert 1.0 <= analysis["average_overall_rating"] <= 5.0
        assert "recurring_issues" in analysis
        assert "top_positive_highlights" in analysis
        assert "ai_improvement_summary" in analysis
        assert len(analysis["actionable_recommendations"]) >= 1

@pytest.mark.asyncio
async def test_current_location_coordinate_routing():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Route from user's current GPS coords in Hyderabad to Gachibowli hotel
        user_coords = "17.4399,78.3800"
        destination = "Sheraton Hyderabad Hotel, Gachibowli"

        # 1. Driving mode
        drive_res = await ac.get(f"/api/routes?origin={user_coords}&destination={destination}&mode=driving")
        assert drive_res.status_code == 200
        drive_data = drive_res.json()
        assert drive_data["distance_km"] > 0
        assert "duration_text" in drive_data
        assert "coordinates" in drive_data or "polyline" in drive_data

        # 2. Walking mode
        walk_res = await ac.get(f"/api/routes?origin={user_coords}&destination={destination}&mode=walking")
        assert walk_res.status_code == 200
        walk_data = walk_res.json()
        assert walk_data["distance_km"] > 0
        # Walking should take longer than driving
        assert walk_data["duration_hours"] > drive_data["duration_hours"]

        # 3. Transit mode
        transit_res = await ac.get(f"/api/routes?origin={user_coords}&destination={destination}&mode=transit")
        assert transit_res.status_code == 200
        transit_data = transit_res.json()
        assert transit_data["distance_km"] > 0
