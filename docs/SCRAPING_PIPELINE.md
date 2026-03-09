# BestInSeattle — Scraping Pipeline

## What it does
`scripts/scrape_to_supabase.py` runs source collection and writes normalized items into Supabase `items_curated`.

Current sources:
- Visit Seattle events + play/family signals
- Seattle Met events + play signals
- The Infatuation restaurant list
- Do206 events (best effort; can return 403 from server-side fetch)

Current content buckets inserted:
- `item_type=restaurant` (restaurants by cuisine)
- `item_type=event` (events with timeframe/price/start)
- `item_type=place` (play/family places)

Thumbnail behavior:
- Pipeline writes `metadata.thumbnail_url` for each ingested record.
- Existing records can be backfilled with default category-aware thumbnails.
- Frontend cards render thumbnails with fallback image if missing.

Booking behavior:
- Pipeline writes `metadata.booking_url` per source/provider when available.
- Event/experience cards now include clickable CTA buttons (open provider/source booking/details page).
- Existing records can be backfilled with source-based booking URLs.

City metadata currently populated:
- Seattle
- Woodinville (for Eastside wine/events items)

## Write behavior
- Reads env from `site/.env.local`
- De-dupes by `(title, source, item_type)` against existing DB rows
- Inserts only new rows with `status='pending'`
- Adds metadata fields:
  - `est_price`
  - `timeframe`
  - `starts_at`
  - `pipeline` version tag

## Runner
`./scripts/run_pipeline.sh` now executes:
1. `collect_seed_data.py` (local seed files)
2. `scrape_to_supabase.py` (live DB insert)
3. fallback API seed endpoint

## Schedule
Cron: `bestinseattle-pipeline` every 4 hours.

## Known gap
Do206 may block direct requests (403). We should add one of:
- RSS/API source replacements first
- browser-assisted fetch fallback for blocked pages
- rotating proxy strategy (optional)
