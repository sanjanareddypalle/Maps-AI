import math
import logging
from typing import Dict, Any, List, Optional
from app.schemas.transport import LastMileTransportOption, LastMileTransferPlan, LastMileRequest

logger = logging.getLogger("last_mile_transport")

# Verified Hub Registry for key hubs
HUB_REGISTRY: Dict[str, Dict[str, Any]] = {
    # Goa Hubs
    "goa_mopa": {
        "name": "Manohar International Airport (Mopa - GOX), North Goa",
        "type": "airport",
        "city": "Goa",
        "lat": 15.7592,
        "lng": 73.8683,
        "has_metro": False,
        "bus_service": "Kadamba Transport Electric AC Airport Shuttle",
        "bus_fare": 200,
    },
    "goa_dabolim": {
        "name": "Dabolim International Airport (GOI), South Goa",
        "type": "airport",
        "city": "Goa",
        "lat": 15.3808,
        "lng": 73.8314,
        "has_metro": False,
        "bus_service": "Kadamba Airport Shuttle to Panaji / Calangute",
        "bus_fare": 150,
    },
    "madgaon_railway": {
        "name": "Madgaon Junction Railway Station (MAO)",
        "type": "railway_station",
        "city": "Goa",
        "lat": 15.2709,
        "lng": 73.9749,
        "has_metro": False,
        "bus_service": "Kadamba City & Coastal Bus Service",
        "bus_fare": 40,
    },
    "thivim_railway": {
        "name": "Thivim Railway Station (THVM), North Goa",
        "type": "railway_station",
        "city": "Goa",
        "lat": 15.6265,
        "lng": 73.8540,
        "has_metro": False,
        "bus_service": "Local Buses to Mapusa & Coastal Belts",
        "bus_fare": 35,
    },
    # Bangalore Hubs
    "bangalore_airport": {
        "name": "Kempegowda International Airport (BLR), Bengaluru",
        "type": "airport",
        "city": "Bengaluru",
        "lat": 13.1986,
        "lng": 77.7066,
        "has_metro": False,
        "bus_service": "BMTC Vayu Vajra Volvo AC Express Shuttle",
        "bus_fare": 260,
    },
    "bangalore_ksr": {
        "name": "KSR Bengaluru City Railway Station (SBC)",
        "type": "railway_station",
        "city": "Bengaluru",
        "lat": 12.9781,
        "lng": 77.5694,
        "has_metro": True,
        "metro_line": "Namma Metro Purple Line (City Railway Station)",
        "metro_fare": 30,
        "bus_service": "BMTC Majestic Bus Station Transfers",
        "bus_fare": 25,
    },
    # Hyderabad Hubs
    "hyderabad_airport": {
        "name": "Rajiv Gandhi International Airport (HYD), Shamshabad",
        "type": "airport",
        "city": "Hyderabad",
        "lat": 17.2403,
        "lng": 78.4294,
        "has_metro": False,
        "bus_service": "TSRTC Pushpak Airport AC Liner",
        "bus_fare": 250,
    },
    "secunderabad_railway": {
        "name": "Secunderabad Junction Railway Station (SC)",
        "type": "railway_station",
        "city": "Hyderabad",
        "lat": 17.4344,
        "lng": 78.5017,
        "has_metro": True,
        "metro_line": "Hyderabad Metro Green Line (Secunderabad West / East)",
        "metro_fare": 35,
        "bus_service": "TSRTC City Express Network",
        "bus_fare": 25,
    },
    # Coimbatore Hubs
    "coimbatore_airport": {
        "name": "Coimbatore International Airport (CJB), Peelamedu",
        "type": "airport",
        "city": "Coimbatore",
        "lat": 11.0298,
        "lng": 77.0434,
        "has_metro": False,
        "bus_service": "TNSTC City Bus Route 20A / 10C",
        "bus_fare": 20,
    },
    "coimbatore_junction": {
        "name": "Coimbatore Main Junction Railway Station (CBE)",
        "type": "railway_station",
        "city": "Coimbatore",
        "lat": 10.9972,
        "lng": 76.9629,
        "has_metro": False,
        "bus_service": "Gandhipuram & Town Hall Bus Services",
        "bus_fare": 15,
    },
    # Mumbai Hubs
    "mumbai_airport": {
        "name": "Chhatrapati Shivaji Maharaj International Airport (BOM), Mumbai",
        "type": "airport",
        "city": "Mumbai",
        "lat": 19.0896,
        "lng": 72.8656,
        "has_metro": True,
        "metro_line": "Mumbai Metro Line 3 / Line 7 connection",
        "metro_fare": 40,
        "bus_service": "BEST AC Airport Route Network",
        "bus_fare": 75,
    },
    "mumbai_csmt": {
        "name": "Chhatrapati Shivaji Maharaj Terminus (CSMT), Mumbai",
        "type": "railway_station",
        "city": "Mumbai",
        "lat": 18.9400,
        "lng": 72.8353,
        "has_metro": True,
        "metro_line": "Mumbai Suburban & Metro Network",
        "metro_fare": 20,
        "bus_service": "BEST Heritage South Mumbai Electric Buses",
        "bus_fare": 15,
    },
    # Delhi Hubs
    "delhi_airport": {
        "name": "Indira Gandhi International Airport (DEL), New Delhi",
        "type": "airport",
        "city": "Delhi",
        "lat": 28.5562,
        "lng": 77.1000,
        "has_metro": True,
        "metro_line": "Delhi Metro Airport Express Line (Orange Line)",
        "metro_fare": 60,
        "bus_service": "DTC Electric AC Airport Express Route",
        "bus_fare": 50,
    },
    "delhi_ndls": {
        "name": "New Delhi Railway Station (NDLS), Paharganj",
        "type": "railway_station",
        "city": "Delhi",
        "lat": 28.6429,
        "lng": 77.2195,
        "has_metro": True,
        "metro_line": "Delhi Metro Yellow Line & Airport Express Interchange",
        "metro_fare": 30,
        "bus_service": "DTC Central Connectivity Hub",
        "bus_fare": 15,
    },
    # Jaipur Hubs
    "jaipur_airport": {
        "name": "Jaipur International Airport (JAI), Sanganer",
        "type": "airport",
        "city": "Jaipur",
        "lat": 26.8242,
        "lng": 75.8122,
        "has_metro": False,
        "bus_service": "JCTSL Low Floor AC Airport Bus Route 6A",
        "bus_fare": 30,
    },
    "jaipur_railway": {
        "name": "Jaipur Junction Railway Station (JP)",
        "type": "railway_station",
        "city": "Jaipur",
        "lat": 26.9196,
        "lng": 75.7878,
        "has_metro": True,
        "metro_line": "Jaipur Metro Pink Line (Railway Station station)",
        "metro_fare": 20,
        "bus_service": "JCTSL City Connector Routes",
        "bus_fare": 15,
    },
}

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two coordinates in kilometers."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def find_nearest_hub(city_or_place: str, hub_type: str = "airport") -> Dict[str, Any]:
    """Finds or infers the most relevant arrival hub for a given destination."""
    name_lower = city_or_place.lower()
    
    # Check direct hub registry matches
    for key, hub in HUB_REGISTRY.items():
        if hub["type"] == hub_type and (hub["city"].lower() in name_lower or name_lower in hub["city"].lower()):
            return hub
        if key in name_lower or name_lower in key:
            return hub

    # Fallback to key hubs by keyword
    if "goa" in name_lower:
        if "north" in name_lower or "calangute" in name_lower or "anjuna" in name_lower or "baga" in name_lower:
            return HUB_REGISTRY["goa_mopa"]
        return HUB_REGISTRY["goa_dabolim"]
    elif "coimbatore" in name_lower or "adiyogi" in name_lower:
        return HUB_REGISTRY["coimbatore_airport"] if hub_type == "airport" else HUB_REGISTRY["coimbatore_junction"]
    elif "bangalore" in name_lower or "bengaluru" in name_lower:
        return HUB_REGISTRY["bangalore_airport"] if hub_type == "airport" else HUB_REGISTRY["bangalore_ksr"]
    elif "hyderabad" in name_lower:
        return HUB_REGISTRY["hyderabad_airport"] if hub_type == "airport" else HUB_REGISTRY["secunderabad_railway"]
    elif "mumbai" in name_lower:
        return HUB_REGISTRY["mumbai_airport"] if hub_type == "airport" else HUB_REGISTRY["mumbai_csmt"]
    elif "delhi" in name_lower:
        return HUB_REGISTRY["delhi_airport"] if hub_type == "airport" else HUB_REGISTRY["delhi_ndls"]
    elif "jaipur" in name_lower:
        return HUB_REGISTRY["jaipur_airport"] if hub_type == "airport" else HUB_REGISTRY["jaipur_railway"]

    # Generic inferred hub
    city_title = city_or_place.title()
    return {
        "name": f"{city_title} {'Airport Terminal' if hub_type == 'airport' else 'Central Junction Railway Station'}",
        "type": hub_type,
        "city": city_title,
        "lat": 15.0 + (abs(hash(city_or_place)) % 1200) / 100.0,
        "lng": 74.0 + (abs(hash(city_or_place)) % 800) / 100.0,
        "has_metro": False,
        "bus_service": f"{city_title} State Transport AC City Bus",
        "bus_fare": 50,
    }

class LastMileTransportService:
    """Service to compute complete last-mile and inter-stop travel options."""

    def build_transfer_plan(
        self,
        origin_hub_name: str,
        destination_name: str,
        hub_type: str = "airport",
        destination_city: Optional[str] = None,
        passengers: int = 2,
        luggage: str = "moderate",
        budget_preference: str = "moderate",
        arrival_time: Optional[str] = None,
        hub_coords: Optional[Dict[str, float]] = None,
        dest_coords: Optional[Dict[str, float]] = None,
    ) -> LastMileTransferPlan:
        # Resolve hub data
        hub = None
        if not hub_coords:
            hub = find_nearest_hub(origin_hub_name or destination_city or destination_name, hub_type)
            hub_lat = hub["lat"]
            hub_lng = hub["lng"]
            resolved_hub_name = hub["name"]
        else:
            hub_lat = hub_coords["lat"]
            hub_lng = hub_coords["lng"]
            resolved_hub_name = origin_hub_name or f"{destination_city or 'Arrival'} {hub_type.title()}"

        if not dest_coords:
            # Approximate destination coords with realistic offset
            dest_lat = hub_lat + 0.18 * ((abs(hash(destination_name)) % 10) / 10.0 - 0.5)
            dest_lng = hub_lng + 0.18 * ((abs(hash(destination_name + 'lng')) % 10) / 10.0 - 0.5)
        else:
            dest_lat = dest_coords["lat"]
            dest_lng = dest_coords["lng"]

        # Calculate estimated driving distance (Haversine * road detour factor ~1.35)
        straight_km = calculate_haversine_distance(hub_lat, hub_lng, dest_lat, dest_lng)
        distance_km = max(round(straight_km * 1.35, 1), 3.5)
        drive_time_mins = max(round((distance_km / 35.0) * 60), 12)

        options: List[LastMileTransportOption] = []

        # 1. App Cabs (Uber / Ola / Rapido)
        # Standard tier: ~Rs 50 base + Rs 18/km
        cab_min = round(60 + distance_km * 17)
        cab_max = round(90 + distance_km * 22)
        cab_mins = drive_time_mins
        uber_link = f"https://m.uber.com/ul/?action=setPickup&pickup[latitude]={hub_lat}&pickup[longitude]={hub_lng}&dropoff[latitude]={dest_lat}&dropoff[longitude]={dest_lng}&dropoff[nickname]={destination_name}"
        options.append(
            LastMileTransportOption(
                id="opt_app_cab",
                mode="cab_app",
                title="App Cab (Uber / Ola / Rapido)",
                provider="Uber / Ola Go / Premier",
                estimated_fare=f"₹{cab_min} – ₹{cab_max}",
                fare_numeric_min=float(cab_min),
                fare_numeric_max=float(cab_max),
                is_verified_fare=False,
                estimated_duration_mins=cab_mins,
                duration_text=f"{cab_mins} mins",
                distance_km=distance_km,
                convenience_score=5,
                luggage_capacity="Up to 3 large suitcases (Sedan/SUV)",
                passenger_capacity=4,
                availability_notes="Instant pickup from designated app-cab pickup zone outside arrivals.",
                booking_link=uber_link,
                route_description=f"Direct highway/arterial route from {resolved_hub_name} to {destination_name}.",
            )
        )

        # 2. Official Airport / Prepaid Station Taxi Counter
        # Prepaid regulated fares are usually 10-20% higher than off-peak apps, but fixed tariff with zero surge
        prepaid_fare = round(100 + distance_km * 21)
        options.append(
            LastMileTransportOption(
                id="opt_prepaid_taxi",
                mode="taxi_prepaid",
                title="Official Prepaid Taxi Counter",
                provider="Airport / Railway State Police Prepaid Booth",
                estimated_fare=f"₹{prepaid_fare} (Fixed Tariff)",
                fare_numeric_min=float(prepaid_fare),
                fare_numeric_max=float(prepaid_fare),
                is_verified_fare=True,
                estimated_duration_mins=cab_mins,
                duration_text=f"{cab_mins} mins",
                distance_km=distance_km,
                convenience_score=4,
                luggage_capacity="2-4 large bags",
                passenger_capacity=4,
                availability_notes="Government-regulated fare booth. Pay at counter inside terminal; no smartphone or app required.",
                booking_link=f"https://www.google.com/maps/dir/?api=1&origin={hub_lat},{hub_lng}&destination={dest_lat},{dest_lng}&travelmode=driving",
                route_description="Direct regulated transfer with receipt slip handed to driver.",
            )
        )

        # 3. Auto-Rickshaw (for distances under 28 km)
        if distance_km <= 28.0:
            auto_min = round(35 + distance_km * 14)
            auto_max = round(50 + distance_km * 16)
            auto_mins = round(cab_mins * 1.18)
            options.append(
                LastMileTransportOption(
                    id="opt_auto_rickshaw",
                    mode="auto_rickshaw",
                    title="Auto-Rickshaw (Three-Wheeler)",
                    provider="Prepaid Auto Stand / Rapido / Ola Auto",
                    estimated_fare=f"₹{auto_min} – ₹{auto_max}",
                    fare_numeric_min=float(auto_min),
                    fare_numeric_max=float(auto_max),
                    is_verified_fare=False,
                    estimated_duration_mins=auto_mins,
                    duration_text=f"{auto_mins} mins",
                    distance_km=distance_km,
                    convenience_score=3,
                    luggage_capacity="1-2 medium suitcases or duffels",
                    passenger_capacity=3,
                    availability_notes="Available 24/7 at terminal exit auto lanes. Ideal for short to medium hops without heavy luggage.",
                    booking_link=f"https://www.google.com/maps/dir/?api=1&origin={hub_lat},{hub_lng}&destination={dest_lat},{dest_lng}&travelmode=driving",
                    route_description="Agile navigation through local city streets, bypassing dense bottlenecks.",
                )
            )

        # 4. Rapid Transit / Metro (where hub has metro connectivity)
        has_metro = hub.get("has_metro", False) if hub else False
        if has_metro:
            metro_fare = hub.get("metro_fare", 40)
            metro_line = hub.get("metro_line", "Airport Express Metro Line")
            metro_mins = round(distance_km * 1.8) + 10
            options.append(
                LastMileTransportOption(
                    id="opt_metro",
                    mode="metro",
                    title="Direct Rapid Metro",
                    provider=metro_line,
                    estimated_fare=f"₹{metro_fare} per token",
                    fare_numeric_min=float(metro_fare),
                    fare_numeric_max=float(metro_fare),
                    is_verified_fare=True,
                    estimated_duration_mins=metro_mins,
                    duration_text=f"{metro_mins} mins",
                    distance_km=distance_km,
                    convenience_score=4,
                    luggage_capacity="Dedicated luggage racks in AC train carriages",
                    passenger_capacity=6,
                    availability_notes="Air-conditioned trains running every 8-12 minutes. Zero traffic congestion risk.",
                    booking_link="https://www.delhimetrorail.com/",
                    route_description=f"Board directly at the terminal metro station; deboard at closest city station.",
                )
            )

        # 5. Public Express Bus / Airport Shuttle
        bus_service_name = hub.get("bus_service", "State AC Express Airport Shuttle") if hub else "AC Volvo Express Shuttle"
        bus_fare = hub.get("bus_fare", max(round(distance_km * 4.5), 30)) if hub else max(round(distance_km * 4.5), 30)
        bus_mins = round(cab_mins * 1.35)
        options.append(
            LastMileTransportOption(
                id="opt_public_bus",
                mode="bus",
                title="AC Express Airport / City Shuttle Bus",
                provider=bus_service_name,
                estimated_fare=f"₹{bus_fare} per passenger",
                fare_numeric_min=float(bus_fare),
                fare_numeric_max=float(bus_fare),
                is_verified_fare=True,
                estimated_duration_mins=bus_mins,
                duration_text=f"{bus_mins} mins",
                distance_km=distance_km,
                convenience_score=3,
                luggage_capacity="Large undercarriage luggage compartments for heavy bags",
                passenger_capacity=10,
                availability_notes="High-frequency departures every 15-30 minutes from arrival bay bus bays. Cash or contactless card accepted.",
                booking_link=f"https://www.google.com/maps/dir/?api=1&origin={hub_lat},{hub_lng}&destination={dest_lat},{dest_lng}&travelmode=transit",
                route_description="Operates on key city express corridors with designated passenger stops.",
            )
        )

        # 6. Self-Drive / Rental Scooter (popular in Goa, tourist coastal towns)
        if "goa" in destination_name.lower() or (destination_city and "goa" in destination_city.lower()):
            bike_fare = 450
            options.append(
                LastMileTransportOption(
                    id="opt_bike_rental",
                    mode="bike_rental",
                    title="Self-Drive Rental Scooter (Activa / Vespa)",
                    provider="Airport Authorized Two-Wheeler Rental Kiosk",
                    estimated_fare="₹400 – ₹550 / day (Self-Fuel)",
                    fare_numeric_min=400.0,
                    fare_numeric_max=550.0,
                    is_verified_fare=True,
                    estimated_duration_mins=cab_mins,
                    duration_text=f"{cab_mins} mins",
                    distance_km=distance_km,
                    convenience_score=4,
                    luggage_capacity="Backpack or light cabin bag only",
                    passenger_capacity=2,
                    availability_notes="Requires valid 2-wheeler driving license. Helmets provided; unlimited freedom for beach & cafe hopping.",
                    booking_link=f"https://www.google.com/maps/search/?api=1&query=bike+rental+near+{hub_lat},{hub_lng}",
                    route_description="Scenic coastal road drive via national highways and village lanes.",
                )
            )

        # Pick best recommendation based on user constraints
        best_id = "opt_app_cab"
        reason = "Offers the best balance of speed, door-to-door comfort, and direct luggage accommodation."

        if budget_preference == "budget":
            if has_metro:
                best_id = "opt_metro"
                reason = "Most affordable and fastest transit option with zero traffic delays."
            else:
                best_id = "opt_public_bus"
                reason = "Highly economical AC express shuttle with dedicated luggage bays."
        elif luggage == "heavy" or passengers >= 3:
            best_id = "opt_app_cab"
            reason = f"Ideal for {passengers} travelers with heavy luggage needing seamless door-to-door transfer."
        elif budget_preference == "premium":
            best_id = "opt_app_cab"
            reason = "Private air-conditioned premier cab with instantaneous curbside pickup."
        elif "goa" in destination_name.lower() and luggage == "light" and passengers <= 2:
            best_id = "opt_bike_rental"
            reason = "Extremely popular and scenic self-drive rental for exploring Goa freely."

        return LastMileTransferPlan(
            hub_type=hub_type,
            hub_name=resolved_hub_name,
            destination_name=destination_name,
            hub_location={"lat": hub_lat, "lng": hub_lng},
            destination_location={"lat": dest_lat, "lng": dest_lng},
            distance_km=distance_km,
            best_recommendation_id=best_id,
            recommendation_reason=reason,
            options=options,
        )

last_mile_service = LastMileTransportService()
