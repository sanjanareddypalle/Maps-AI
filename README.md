# Google Maps AI — Intelligent Travel & Road Trip Planner

> A complete, modern, responsive full-stack web application that unifies **Next.js 15 (React 19 & Tailwind CSS)**, **Python FastAPI**, the **Google Agent Development Kit (ADK)**, and **Google Maps MCP / Google Maps Platform** to empower travelers to plan scenic road trips, discover local gems, and build personalized day-by-day itineraries with a conversational AI agent.

---

## 🌟 Key Features

1. **Intelligent Conversational Agent (Google ADK)**
   - Powered by the official `google-adk` package with tool dispatching.
   - Understands subjective constraints (e.g., *"Make this itinerary more affordable"*, *"Find highway diners along my route"*, *"Avoid toll roads"*).
   - Generates realistic multi-day itineraries with day-by-day stops, estimated durations, and explanations for each stop.

2. **Google Maps MCP & Platform Integration**
   - Integrates with `@modelcontextprotocol/server-google-maps` tooling (`maps_geocode`, `maps_directions`, `maps_search_places`).
   - Sourced from Google Maps Platform (Routes, Places, Geocoding).
   - Graceful verified baseline corridor datasets (Hyderabad to Hampi, Mumbai to Goa, Bengaluru to Coorg) when live keys are in development/demo mode, explicitly labeled.

3. **Split-Screen AI Trip Planner (`/planner`)**
   - Desktop split view: left panel conversational chat + parameters form, right panel interactive map canvas.
   - Mobile responsive layout with dedicated tab toggling between chat and full-screen map.
   - Interactive waypoint markers with stop rating badges, time allocations, and direct Google Maps navigation links.

4. **Robust Authentication & Security**
   - Password hashing with salt using `bcrypt`.
   - JWT session management (`pyjwt`) with Bearer token authentication.
   - Strict server-side ownership enforcement on trips and saved places.
   - Split-screen registration with real-time password strength meter.

5. **Place Discovery & Favorites (`/explore`)**
   - Category filtering (Attractions, Dining, Viewpoints, Nature).
   - Geolocation lookup (browser permission prompt with manual fallback).
   - Save places directly to account favorites.

6. **My Trips Management (`/trips`)**
   - List saved itineraries, view timeline details, edit titles/budgets, duplicate trips, and delete with confirmation.

7. **Database Persistence**
   - Async SQLAlchemy ORM supporting standard PostgreSQL via `DATABASE_URL`.
   - Automatic fallback to async SQLite (`sqlite+aiosqlite:///./travel_planner.db`) for immediate zero-friction local execution.

---

## 🏗️ Architecture

```
google-maps-ai/
├── frontend/                     # Next.js 15 + React 19 + Tailwind CSS
│   ├── app/
│   │   ├── layout.tsx            # Global layout + AuthProvider
│   │   ├── page.tsx              # Public Landing Page
│   │   ├── login/page.tsx        # Sign-in with password reset modal
│   │   ├── signup/page.tsx       # Split-screen registration & strength meter
│   │   ├── onboarding/page.tsx   # Travel preference collector
│   │   ├── dashboard/page.tsx    # Protected dashboard with collapsible sidebar
│   │   ├── planner/page.tsx      # Core AI Trip Planner (Split Chat & Map)
│   │   ├── explore/page.tsx      # Place discovery & favorites
│   │   ├── trips/page.tsx        # Saved trips CRUD & day timelines
│   │   └── settings/page.tsx     # User profile, preferences & security
│   ├── components/
│   │   ├── Navbar.tsx            # Sticky navigation with mobile drawer
│   │   ├── Footer.tsx            # Full-featured footer
│   │   └── map/InteractiveMap.tsx# Google Map component with live/demo modes
│   ├── lib/
│   │   ├── api.ts                # Centralized typed HTTP client
│   │   ├── auth-context.tsx      # React authentication context & session hooks
│   │   └── types.ts              # Data contracts
│   └── package.json
├── backend/                      # Python FastAPI + Google ADK + SQLAlchemy
│   ├── app/
│   │   ├── main.py               # FastAPI entry point, CORS, and routers
│   │   ├── config.py             # Pydantic BaseSettings & environment configs
│   │   ├── database/
│   │   │   ├── session.py        # Async engine & session factory
│   │   │   └── models.py         # User, Preference, Trip, SavedPlace models
│   │   ├── auth/
│   │   │   └── security.py       # Bcrypt password hashing & JWT token logic
│   │   ├── mcp/
│   │   │   ├── types.py          # MCP tool call & result schemas
│   │   │   └── adapter.py        # Google Maps MCP adapter & verified catalog
│   │   ├── agents/
│   │   │   ├── tools.py          # ADK tool definitions
│   │   │   └── travel_agent.py   # Google ADK agent service & orchestrator
│   │   ├── schemas/              # Pydantic validation schemas
│   │   └── api/                  # FastAPI routers (auth, user, trips, places, routes)
│   ├── tests/
│   │   └── test_api.py           # Automated test suite (Pytest + AsyncClient)
│   └── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ (tested on Node v24 & Bun v1.3)
- **Python**: v3.10+ (tested on Python 3.14)
- Optional: PostgreSQL (SQLite async fallback works out-of-the-box)

---

### Step 1: Backend Setup & Launch

1. Open a terminal in `backend/`:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run automated tests to verify your environment:
   ```bash
   python -m pytest tests/test_api.py -v
   ```

4. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   The backend will be live at:
   - API Root: `http://127.0.0.1:8000`
   - Interactive Swagger Docs: `http://127.0.0.1:8000/api/docs`
   - Health Check: `http://127.0.0.1:8000/api/health`

---

### Step 2: Frontend Setup & Launch

1. Open a separate terminal in `frontend/`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   bun install
   # or: npm install
   ```

3. Build or start the development server:
   ```bash
   bun run dev
   # or: npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🔑 Environment Configuration

Copy `.env.example` to `.env` in the root and configure keys as needed:

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | SQLAlchemy connection string | `sqlite+aiosqlite:///./travel_planner.db` |
| `SECRET_KEY` | JWT HMAC secret key | Pre-configured dev default |
| `GEMINI_API_KEY` | Google AI Studio Gemini API key | Optional (Agent runs with deterministic fallbacks if absent) |
| `GOOGLE_MAPS_API_KEY` | Google Maps Platform API key (Routes, Places) | Optional (Demo mode provides verified datasets if absent) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Browser-restricted Google Maps JavaScript API key | Optional (Interactive vector map preview active if absent) |

---

## 🧪 Testing

The backend includes automated tests covering authentication, token validation, user preferences, trip planning, ownership checks, and place discovery.

Run all tests from `backend/`:
```bash
python -m pytest tests/test_api.py -v
```

---

## 🛡️ License & Attributions
Built for intelligent road trips with Google Maps Platform and Google Agent Development Kit. All verified benchmark route coordinates and place ratings are sourced from public geographic databases.
