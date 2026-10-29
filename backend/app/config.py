import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    PROJECT_NAME: str = "Google Maps AI Travel Planner"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Security & Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "google-maps-ai-dev-secret-key-32chars-min-security-change-in-prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database: Supports PostgreSQL, falls back to async SQLite for friction-free local dev
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./travel_planner.db")

    # AI & Google Services
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")
    GOOGLE_MAPS_SERVER_KEY: str = os.getenv("GOOGLE_MAPS_SERVER_KEY", "")

    # Google Maps MCP Configuration
    MCP_ENABLED: bool = os.getenv("MCP_ENABLED", "true").lower() in ("true", "1", "yes")
    MCP_SERVER_URL: str = os.getenv("MCP_SERVER_URL", "")
    MCP_SERVER_COMMAND: str = os.getenv("MCP_SERVER_COMMAND", "npx -y @modelcontextprotocol/server-google-maps")

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ]

settings = Settings()
