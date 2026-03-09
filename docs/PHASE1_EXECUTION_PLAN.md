# BestInSeattle — Phase 1 (Data Stabilization) Execution Plan

Owner: Marcel
Start: 2026-03-07
Goal: move from prototype ingestion to trustworthy, production-grade city activity data.

---

## Phase 1 Scope

1. Structured source adapters (Seattle, Bellevue, Kirkland, Redmond)
2. Normalize → dedupe → upsert flow
3. Confidence/freshness scoring and publish gates
4. Conflict queue for ambiguous duplicates

---

## Sub-plan inside Phase 1: Build Track

## Track A — Data Model Hardening (Day 1)
- Add staging table migration (`items_ingest_staging`)
- Add conflict/review queue migration (`items_conflict_queue`)
- Add metadata contract fields:
  - `dedupe_fingerprint`
  - `quality_score`
  - `freshness_expires_at`
  - `pipeline_run_id`

## Track B — Pipeline Logic (Day 1–2)
- Build normalizer/upserter script (`phase1_normalize_and_upsert.py`)
- Rules:
  - canonical title normalization
  - deterministic fingerprint
  - confidence score baseline from source
  - freshness expiration by timeframe
- Upsert by `(item_type,title,source)` (short-term)

## Track C — Quality Gates (Day 2)
- Publish gate policy:
  - reject missing `title/item_type/city/content_type`
  - mark low confidence (`quality_score < 0.65`) as `rejected`
  - keep medium confidence as `pending`
- Attach conflict flags for suspected duplicates

## Track D — Ops & Monitoring (Day 2–3)
- Add pipeline summary output each run:
  - inserted
  - updated
  - rejected
  - conflict candidates
- Keep cron at 4h during stabilization

---

## Immediate Implementation Checklist (starting now)

- [x] Create Phase 1 plan doc
- [ ] Add SQL migration file for staging/conflict tables
- [ ] Implement normalize/upsert script and run once
- [ ] Patch `run_pipeline.sh` to call normalize/upsert step
- [ ] Execute full pipeline and verify summary output
- [ ] Commit and report metrics snapshot

---

## Success Criteria for Phase 1 completion

1. Dedupe fingerprint present on >95% new records
2. Every record has city + content_type + source lineage
3. Quality score and freshness fields populated on all new records
4. Conflict queue populated for ambiguous candidates instead of silent overwrite
5. Nightly stale ratio report available
