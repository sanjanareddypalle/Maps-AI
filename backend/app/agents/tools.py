import asyncio
from typing import Dict, Any, List, Optional
from app.mcp.adapter import mcp_adapter

async def geocode_location_async(address: str) -> Dict[str, Any]:
    """Resolves an address or landmark into geographic coordinates (latitude, longitude) and formatted address."""
    result = await mcp_adapter.geocode(address)
    return result.model_dump()

async def get_route_directions_async(origin: str, destination: str, mode: str = "driving", avoid_tolls: bool = False) -> Dict[str, Any]:
    """Calculates driving routes, accurate distances, estimated travel durations, and toll information between origin and destination."""
    result = await mcp_adapter.get_directions(origin=origin, destination=destination, mode=mode, avoid_tolls=avoid_tolls)
    return result.model_dump()

async def search_places_along_route_async(query: str, category: str = "attraction") -> Dict[str, Any]:
    """Searches for verified attractions, restaurants, viewpoints, and culture stops along the given corridor."""
    result = await mcp_adapter.search_places(query=query, category=category)
    return result.model_dump()

def geocode_location(address: str) -> Dict[str, Any]:
    """Resolves an address or landmark into geographic coordinates (latitude, longitude) and formatted address."""
    return asyncio.run(geocode_location_async(address))

def get_route_directions(origin: str, destination: str, mode: str = "driving", avoid_tolls: bool = False) -> Dict[str, Any]:
    """Calculates driving routes, accurate distances, estimated travel durations, and toll information between origin and destination."""
    return asyncio.run(get_route_directions_async(origin, destination, mode, avoid_tolls))

def search_places_along_route(query: str, category: str = "attraction") -> Dict[str, Any]:
    """Searches for verified attractions, restaurants, viewpoints, and culture stops along the given corridor."""
    return asyncio.run(search_places_along_route_async(query, category))
