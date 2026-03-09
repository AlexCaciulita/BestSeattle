# BestInSeattle — Build Blueprint (v1)

Last updated: 2026-03-07
Owner: Alex + Marcel

## 0) Product Thesis
Build a premium editorial local platform for **Seattle + PNW** that combines:
1. curated events
2. best places (restaurants + things to do)
3. a weekly newsletter
4. sponsored placements (clearly labeled)

No login required in v1. Manual curation first.

---

## 1) Positioning
**BestInSeattle** = "The cleanest way to discover what’s worth doing in Seattle + PNW."

### North-star outcomes (90 days)
- 5,000+ monthly site visitors
- 1,500+ newsletter subscribers
- 3+ paying sponsors
- 100% labeled sponsored content

---

## 2) Information Architecture

## Primary pages
- `/` Home
- `/events` (today, this week, this weekend)
- `/zones` + zone pages
- `/best-of` + category pages
- `/newsletter`
- `/about`
- `/sponsored` (policy page, no nav link)

## Zone taxonomy (launch)
Seattle core:
- Downtown/Belltown/SLU
- Capitol Hill/Central District
- Ballard/Fremont/Wallingford
- Queen Anne/Magnolia
- U District/Green Lake
- West Seattle

Eastside:
- Bellevue
- Redmond
- Kirkland

PNW edge:
- Tacoma
- Everett

---

## 3) Data Model (v1)

## Tables
- `sources`
  - id, name, url, type(event|restaurants|guide), trust_weight
- `items_raw`
  - id, source_id, source_url, fetched_at, raw_payload
- `items_curated`
  - id, item_type(event|place), title, summary, zone, starts_at, price_band, tags[], image_url, status(draft|approved|published), sponsor_flag, sponsor_label
- `places`
  - id, name, zone, category, cuisine, address, lat, lng
- `scores`
  - place_id, editorial_score, source_score, recency_score, social_score, aggregate_score
- `newsletter_issues`
  - id, issue_date, subject, hero_item_id, status

---

## 4) Scoring Framework (restaurants/places)
Use blended score (0-100):
- 35% editorial consensus (mentions in trusted guides)
- 25% source quality (tiered source trust)
- 15% recency (newly confirmed/open + recent mentions)
- 15% social signal (engagement proxies)
- 10% manual editor override

## Trust tiers
- Tier A (weight 1.0): Seattle Met, Infatuation, established local publications
- Tier B (0.8): Visit Seattle, strong local blogs
- Tier C (0.6): user/community sources (needs manual confirmation)

Rule: no place is published without a human curation pass.

---

## 5) Ingestion + Curation Workflow
1. Collector jobs run 3–4x/day
2. Normalize to `items_raw`
3. Deduplicate
4. Auto-tag zone/category
5. Send to manual curation queue
6. Publish to site + queue newsletter candidates

## Initial sources
- do206.com
- visitseattle.org
- seattlemet.com
- theinfatuation.com/seattle
- everout.com/seattle (where technically accessible)

---

## 6) Frontend/UI Spec
Style target: bestdubai-like cleanliness, premium editorial voice.

## Theme candidates (A/B)
A. Light premium
- bg `#FAF9F6`, text `#111`, accent `#C9A227`

B. Black + gold
- bg `#0C0C0C`, text `#F5F5F5`, accent `#D4AF37`

Recommendation: use A for core product UX, keep B for campaign visuals.

---

## 7) Monetization (v1)
- Newsletter sponsor block (1-2 per issue)
- Sponsored in-feed card on home/events
- Featured listing in category pages

All paid placements must show `Sponsored` badge.
No separate "Advertise" nav page (per owner decision).

---

## 8) 30-Day Execution Plan

## Week 1
- Lock brand/name/domain
- Finalize schema + ingestion skeleton
- Build homepage/events/zones shells

## Week 2
- Build curation queue (internal)
- Seed first 200 events + 100 places
- Publish initial Best Of pages

## Week 3
- Launch newsletter issue #1
- Start social clips + daily posting workflow
- Establish sponsor package pricing

## Week 4
- Run first sponsor pilots
- Measure CTR, signup conversion, subscriber retention
- Tighten scoring model and editorial templates

---

## 9) KPIs dashboard
- visitors/day
- signup conversion rate
- active subscribers
- open rate / click rate
- sponsor revenue / issue
- time-to-publish per curated item

---

## 10) Risks + mitigations
- **Scrape fragility** → prioritize sources with stable feeds/APIs
- **Content quality drift** → strict manual QA checklist
- **Ad trust risk** → hard sponsorship standards + visible labels
- **Scope creep** → Seattle core first, then PNW edges
