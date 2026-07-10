# Orion

A full-stack space exploration dashboard that aggregates live data from NASA and other public space APIs into a single interface. Built as a production-grade learning project with deliberate focus on backend infrastructure: caching strategy, background job scheduling, rate limiting, and graceful degradation.

**Live:** https://orion-swart-beta.vercel.app

## Features

- **Astronomy Picture of the Day** — NASA's daily image or video with full explanation, pre-fetched at midnight by a scheduled job so the first request of the day is served from cache.
- **ISS Live Tracker** — real-time position of the International Space Station on an interactive dark-themed map, with a fading ground-track trail showing the last 30 minutes of orbit. Clicking the station opens a telemetry panel (altitude, velocity, coordinates).
- **Launch Schedule** — upcoming rocket launches worldwide with a live T-minus countdown for the next launch, provider and pad details, and mission descriptions.
- **Asteroid Watch** — near-Earth objects passing within the next seven days, with size comparisons, velocity, miss distance, and hazard classification.

## Architecture

```
Browser (React, Vercel CDN)
        │
        ▼
Express API (Railway)
        │
        ├── Redis (Upstash) ── response cache, rolling ISS trail,
        │                      rate-limit counters, BullMQ job queue
        │
        └── External APIs ──── NASA APOD, NASA NeoWs,
                               Launch Library 2, ISS telemetry
```

The backend acts as a caching proxy and coordinator rather than a simple pass-through. Key decisions:

**Per-resource cache TTLs.** Every route is wrapped in Redis cache middleware, but expiry is matched to how quickly the underlying data changes: 35 seconds for ISS position, 10 minutes for asteroid data, 30 minutes for launches, 24 hours for APOD. The launches route depends on this — Launch Library 2 allows roughly 15 requests per hour, so a shared cached response is the difference between a working feature and a broken one.

**Cache pre-warming.** BullMQ workers run on a schedule against the same Redis instance: an APOD fetcher fires at midnight daily, and an ISS poller refreshes position every 30 seconds. User requests are served from a cache that background jobs keep warm, so external API latency is almost never on the request path.

**Error responses are never cached.** The cache middleware checks `res.statusCode` before writing to Redis. An earlier version cached a 500 response body and served it as a 200 for the duration of the TTL — a bug worth documenting because it is easy to introduce and unpleasant to diagnose.

**Fallback chain for ISS telemetry.** The primary source (wheretheiss.at, which provides altitude and velocity) proved unreliable from datacenter IPs. The fetch logic falls back to Open Notify (position only), substituting orbital averages for the missing fields and tagging the response with its source so the UI can label estimated values honestly.

**Redis-backed rate limiting.** 100 requests per IP per minute, with counters stored in Redis rather than process memory so the limit holds correctly if the backend is ever scaled horizontally.

**Route-level code splitting.** Each page is lazy-loaded, which keeps the mapping library (Leaflet, ~157 kB) out of the main bundle entirely. Visitors download it only if they open the ISS tracker.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, TanStack Query, Tailwind CSS, Framer Motion |
| Mapping | Leaflet, react-leaflet (CartoDB dark tiles) |
| Backend | Node.js, Express |
| Cache and queues | Redis (Upstash), BullMQ |
| Deployment | Vercel (frontend), Railway (backend) |

## Data Sources

| API | Used for |
|---|---|
| NASA APOD | Astronomy Picture of the Day |
| NASA NeoWs | Near-Earth object feed |
| Launch Library 2 (The Space Devs) | Upcoming launches |
| wheretheiss.at | ISS telemetry (primary) |
| Open Notify | ISS position (fallback) |

## Running Locally

Requirements: Node 20+, Docker Desktop, a free NASA API key from https://api.nasa.gov.

```bash
git clone https://github.com/Fortu-ne/orion.git
cd orion

# Start local Redis (and Postgres, reserved for planned features)
docker compose up -d

# Backend
cd server
npm install
# create server/.env — see below
npm run start:dev

# Frontend (separate terminal)
cd client
npm install
# create client/.env — see below
npm run dev
```

`server/.env`:
```
NASA_API_KEY=your_key_here
REDIS_URL=redis://localhost:6379
CLIENT_URL=http://localhost:5173
PORT=3000
```

`client/.env`:
```
VITE_API_URL=http://localhost:3000
```

The app runs at http://localhost:5173.

## Project Structure

```
orion/
├── client/                  # React + Vite
│   └── src/
│       ├── components/      # Feature components and shared UI
│       ├── pages/           # Route-level pages (lazy-loaded)
│       ├── hooks/           # TanStack Query hooks, countdown timer
│       └── lib/             # Axios instance, query client
├── server/                  # Express
│   ├── routes/              # One file per resource
│   ├── middleware/          # Redis cache, rate limiting
│   ├── jobs/                # BullMQ queues and scheduled workers
│   └── lib/                 # Redis client, API clients, ISS fallback chain
└── docker-compose.yml       # Local Redis and Postgres
```

## Roadmap

- ISS pass prediction over the user's location (TLE data and satellite.js)
- NASA EPIC Earth imagery and image library search
- Live infrastructure status page (cache hit rate, job history)
- WebSocket push for ISS position, replacing client polling
- Load testing with k6 and publishing the results

## License

MIT
