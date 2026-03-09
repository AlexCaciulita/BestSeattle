# BestInSeattle — Restaurant Availability Architecture

Last updated: 2026-03-07

## Goal
Show the **best restaurants with real table availability** by zone, time window, and party size.

---

## 1) Product Scope (MVP → v2)

## MVP (Phase 1)
- Curated restaurant pages with booking provider links:
  - OpenTable
  - Resy
  - Yelp Reservations
  - Tock
- No live slots yet.
- UX labels:
  - `Book via OpenTable`
  - `Book via Resy`

## Phase 2 (live availability)
- Poll provider availability APIs (where officially supported)
- Snapshot available slots for 2/4/6 party sizes
- Show `Available tonight` badges

## Phase 3 (intelligence)
- Alerts (`notify me when a table opens`)
- Best-time recommendations
- Date-night pairings (table + nearby event)

---

## 2) Data Sources

## Primary booking providers
- OpenTable
- Resy
- Yelp Reservations / Guest Manager
- Tock

## Curated quality sources
- Seattle Met
- The Infatuation
- Internal editorial scoring

Rule: prefer official APIs/partner feeds. Avoid brittle scraping for reservation widgets.

---

## 3) Database Schema (Supabase)

## New tables

### `restaurants`
- `id` bigserial PK
- `name` text not null
- `slug` text unique
- `city` text not null
- `zone` text
- `address` text
- `lat` double precision
- `lng` double precision
- `cuisine` text
- `price_band` text  -- $, $$, $$$, $$$$
- `editorial_score` numeric(5,2)
- `status` text default `active`
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

### `restaurant_booking_sources`
- `id` bigserial PK
- `restaurant_id` bigint references restaurants(id) on delete cascade
- `provider` text not null  -- opentable|resy|yelp|tock
- `provider_restaurant_id` text
- `booking_url` text not null
- `is_primary` boolean default false
- `created_at` timestamptz default now()

### `restaurant_availability_snapshots`
- `id` bigserial PK
- `restaurant_id` bigint references restaurants(id) on delete cascade
- `provider` text not null
- `party_size` int not null
- `target_date` date not null
- `time_window_start` time not null
- `time_window_end` time not null
- `available_slots` jsonb not null default '[]'::jsonb
- `slot_count` int not null default 0
- `fetched_at` timestamptz not null default now()

### `restaurant_booking_clicks`
- `id` bigserial PK
- `restaurant_id` bigint references restaurants(id) on delete cascade
- `provider` text not null
- `surface` text not null -- web|newsletter
- `zone` text
- `clicked_at` timestamptz default now()
- `session_id` text

### `restaurant_waitlist_alerts` (phase 3)
- `id` bigserial PK
- `email` text not null
- `restaurant_id` bigint references restaurants(id) on delete cascade
- `party_size` int not null
- `target_date` date not null
- `time_window_start` time
- `time_window_end` time
- `status` text default 'active' -- active|triggered|expired
- `created_at` timestamptz default now()

---

## 4) API Contract (Next.js)

## Read endpoints
- `GET /api/restaurants`
  - query: `city`, `zone`, `cuisine`, `price_band`, `sort`
- `GET /api/restaurants/available-now`
  - query: `city`, `zone`, `party_size`, `from_time`, `to_time`, `target_date`
  - returns ranked restaurants with slot summaries
- `GET /api/restaurants/:id/availability`
  - query: `party_size`, `target_date`

## Write/admin endpoints
- `POST /api/admin/restaurants/sync` (ingest/normalize)
- `POST /api/admin/restaurants/availability/refresh`
  - body: provider filters, city/zone filters
- `POST /api/restaurants/:id/booking-click`
  - tracks attribution click

## Alert endpoints (phase 3)
- `POST /api/restaurants/:id/waitlist-alert`
- `DELETE /api/restaurants/:id/waitlist-alert/:alert_id`

---

## 5) Ranking Function

`rank_score = 0.55 * editorial_quality + 0.30 * availability_score + 0.15 * zone_fit`

Where:
- `editorial_quality`: normalized score from curation sources + internal editor score
- `availability_score`: based on slot_count + slot proximity to requested time
- `zone_fit`: exact zone match and nearby locality weighting

---

## 6) Job Schedule

## Ingestion jobs
- `restaurants-sync` every 12h
- `availability-refresh` every 30m during service window (11:00–22:30 PT)

## Aggregation jobs
- `available-tonight-cache` every 15m
- `weekend-availability-digest` Thu/Fri/Sat 09:00 PT

---

## 7) MVP UI Components
- `Available Tonight` rail
- `Bookable in [Zone]` cards
- Restaurant card badges:
  - `Available now`
  - `Few tables left`
  - `Book via [provider]`
- Detail page:
  - time slot chips
  - provider switcher

---

## 8) Risk & Compliance
- Use provider-approved data access first.
- Avoid violating platform terms with unauthorized scraping.
- Cache aggressively to avoid API overages.
- Add fallback UX when availability feed is stale:
  - `Check provider for latest slots`

---

## 9) Build Order
1. Create schema and migrations
2. Build `/api/restaurants` + `/api/restaurants/available-now`
3. Add provider mapping table + manual admin mapping tool
4. Add availability snapshot ingestion worker
5. Add UI rails and booking-click tracking
6. Add newsletter block: `Bookable this weekend`
