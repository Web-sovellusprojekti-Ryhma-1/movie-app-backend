# Movie App Backend

Backend REST API for the Movie App project. Provides endpoints for user management, favorites, reviews, groups, Finnkino data, TMDB data, and cross-service movie matching.

## Prerequisites

- Node.js 18 or newer
- npm
- PostgreSQL database (see `db.sql` for schema)
- Finnkino XML endpoints are accessed via headless Chromium (Puppeteer). Ensure the host can launch Chromium processes.

## Environment variables

Create a `.env` file in the project root and define at minimum:

```
PORT=3000
DATABASE_URL=postgres://username:password@localhost:5432/movie_app
TMDB_BEARER=your_tmdb_api_read_access_token
```

`TMDB_BEARER` is required for all TMDB-powered endpoints, including the new Finnkino ↔ TMDB matcher.

## Installation

```pwsh
npm install
```

## Running locally

```pwsh
npm run devStart
```

The server exposes REST endpoints under `http://localhost:<PORT>/api`.

## Testing

```pwsh
npm test
```

Tests rely on Node's built-in test runner and cover the matching heuristics.

## Finnkino ↔ TMDB matching

New helper logic and endpoints allow matching Finnkino events to TMDB movies using title, release date, and runtime similarity.

### GET `/api/match/finnkino/:eventId`

Fetches the Finnkino event by ID and returns the best TMDB match alongside scored candidates.

**Response body**

- `finnkinoEventId` – Finnkino event identifier.
- `finnkinoEvent` – Raw Finnkino event payload.
- `match` – Best match (or `null` if below confidence threshold) with `score`, `componentScores`, and TMDB identifiers.
- `candidates` – Sorted list (highest score first) of evaluated TMDB movies.

### POST `/api/match/finnkino`

Accepts a Finnkino-style event payload in the request body when the frontend already has event details.

```json
{
  "event": {
    "Title": "28 vuotta myöhemmin",
    "OriginalTitle": "28 Years Later",
    "dtLocalRelease": "2025-06-25T00:00:00",
    "LengthInMinutes": 115
  }
}
```

The response mirrors the `GET` endpoint.

### Matching algorithm

1. Search TMDB using the Finnkino original title (falls back to localized title) and release year.
2. Fetch detailed metadata for the top 10 candidates.
3. Score each candidate:
   - Title similarity (Levenshtein-based) – 60%
   - Release date proximity (±30 days linear decay) – 25%
  - Runtime proximity (±45 minutes linear decay) – 15%
4. Return the best candidate when the weighted score ≥ 0.55; otherwise, return `match: null` with candidate breakdowns for manual review.

These scores are exposed in API responses so the frontend can display confidence indicators.
