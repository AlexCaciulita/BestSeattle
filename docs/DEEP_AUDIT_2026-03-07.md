# BestInSeattle — Deep Opus Audit (2026-03-07)

## Executive Summary

The project has a solid visual scaffold and the right architectural instincts (Supabase + Next.js + editorial curation model). But almost nothing actually works end-to-end yet. The scraper is fake, most pages are stubs, and the DB has only 18 records. This audit identifies every gap between "looks like a platform" and "is a platform."

---

## 🔴 CRITICAL — Things That Are Broken or Fake

### 1. The scraper is not actually scraping
`scrape_to_supabase.py` has **hardcoded candidate lists** — it fetches pages but only matches against pre-written title strings. It will never discover a new event or restaurant on its own. This is a demo, not a pipeline.

**Impact:** Zero data growth. The DB will never get bigger on its own.

### 2. Do206 returns 403 — dead source
The scraper tries Do206 every 4 hours and gets blocked every time. Wasted cycles, noisy logs.

### 3. Events page doesn't use Supabase
`/events/page.tsx` calls `getSeedEvents()` which reads from `seed_events.json` on disk — it completely ignores the database. So even if the pipeline inserted events, users would never see them on the events page.

### 4. Best-of pages show the same data regardless of slug
`/best-of/[slug]/page.tsx` always renders the same 10 restaurants from `seed_restaurants.json`. Whether the slug is "coffee", "nightlife", or "date-night" — identical output.

### 5. Zone detail pages are empty stubs
`/zones/[slug]/page.tsx` shows only the zone name and "coming next." No items, no filtering, nothing.

### 6. Newsletter form is non-functional
The email input on `/newsletter` has `type="button"` — no form action, no API call, no email capture backend. Pure decoration.

### 7. Tonight board shows `pending` items to users
`getTonightBoard()` queries `status IN ('approved', 'published', 'pending')`. Pending items should not be user-facing — they haven't been reviewed.

### 8. No mobile navigation
Nav is `hidden md:flex` with no hamburger menu or mobile drawer. On phones, users see only the logo and theme toggle. **The entire navigation is invisible on mobile.**

---

## 🟠 SIGNIFICANT — Architectural & Quality Issues

### 9. Duplicated scoring logic
`scoreItem()` exists in both `discovery.ts` and `tonight-experience-engine.tsx` with nearly identical code. Any scoring change must be made twice. Should be one function.

### 10. Theme toggle has hydration mismatch risk
`ThemeToggle` reads `localStorage` in the `useState` initializer, which runs during SSR where `localStorage` doesn't exist. The `typeof window === "undefined"` guard works, but the theme flickers on load because the server renders "light" and client may switch to "blackgold."

### 11. No image optimization
All images use raw `<img>` tags instead of `next/image`. No lazy loading optimization, no responsive srcSet, no automatic WebP/AVIF conversion. LCP will suffer.

### 12. No individual item/detail pages
There is no `/event/[id]`, `/restaurant/[id]`, or `/place/[id]` route. Every item is a card with nowhere to click through to. This means:
- No SEO for individual venues/events
- No deep linking for sharing
- No place to put rich content (photos, reviews, hours)

### 13. Booking URLs are mostly generic
Most booking URLs point to source homepages (e.g., `visitseattle.org/things-to-do/events/`) rather than the specific event/venue page. Users click "Book / View" and land on a generic listing.

### 14. No error boundaries or loading states
No `error.tsx` or `loading.tsx` files anywhere. If Supabase goes down, users see a white screen or generic Next.js error.

### 15. No SEO infrastructure
- No per-page `metadata` exports (only layout-level)
- No Open Graph tags
- No `sitemap.xml` generation
- No structured data (JSON-LD for events/restaurants)
- No `robots.txt`

### 16. Data layer inconsistency
Some pages read Supabase, some read local JSON, some do both with fallback logic. There's no single "get items by type/zone/status" function.

### 17. Pipeline log grows forever
`pipeline.log` only appends, no rotation or truncation. Will eventually fill disk.

### 18. Admin queue has zero auth
`/admin/queue` is publicly accessible. Anyone can approve or reject items.

---

## 🟡 MODERATE — Missing Features for MVP

### 19. No font optimization
Using system Georgia serif via CSS. No `next/font` for consistent rendering and FOUT prevention.

### 20. No favicon/branding
Still using Next.js default `favicon.ico`. No custom brand mark.

### 21. Plans page is too static
Plan slugs are hardcoded to 3 options (date-night, family-day, rainy-day). No dynamic plan generation from DB categories.

### 22. No "Sponsored" revenue tracking
Sponsored items are flagged but there's no click attribution, impression counting, or sponsor dashboard.

### 23. No search on main pages
Outside the Tonight AI search, there's no search bar on events, zones, or best-of pages.

### 24. collect_seed_data.py is effectively the same as the scraper
Two scripts doing similar work — `collect_seed_data.py` writes to JSON, `scrape_to_supabase.py` writes to DB. Same hardcoded extraction logic.

### 25. No content scheduling / publish dates
Items can be approved but there's no concept of "publish at" or "expires at" in the UI.

---

## 📊 Current State by the Numbers

| Metric | Value |
|---|---|
| Total DB records | 18 |
| Events | 9 |
| Restaurants | 6 |
| Places | 3 |
| Status: pending | ~14 |
| Status: approved | ~4 |
| Status: published | 0 |
| Functional pages | 3 (home, tonight, admin queue) |
| Stub pages | 6 (zones/[slug], best-of/[slug], about, newsletter, sponsored, events*) |
| API routes | 5 (curation CRUD + discovery 2) |
| Working data sources | 3 (Visit Seattle, Seattle Met, Infatuation — all hardcoded match) |
| Dead sources | 1 (Do206 — 403) |
| Components | 7 |
| Mobile nav | ❌ |
| Auth | ❌ |
| Newsletter capture | ❌ |
| Real scraping | ❌ |

*Events page reads local JSON, not DB

---

## 🎯 Priority Fix Order

### P0 — Must fix before anything else (makes the platform real)
1. **Build a real scraper** — actual HTML parsing or API/RSS ingestion
2. **Fix data layer** — all pages read from Supabase, unified query functions
3. **Fix Tonight to exclude pending** — only show approved/published
4. **Add mobile nav** — hamburger menu or bottom nav
5. **Wire newsletter email capture** — even a simple Supabase insert

### P1 — Required for soft launch
6. Build item detail pages (`/item/[id]`)
7. Make zone pages show filtered DB items
8. Make best-of pages filter by category
9. Add error.tsx and loading.tsx
10. Add basic per-page SEO metadata
11. Fix image optimization (next/image)
12. Consolidate scoring into one function
13. Remove Do206 from scraper (dead)

### P2 — Required for public launch
14. Admin auth (even basic password gate)
15. Sitemap + robots.txt generation
16. Structured data (JSON-LD)
17. Sponsor click tracking
18. Pipeline monitoring + log rotation
19. Custom favicon + brand assets
20. Theme toggle fix (suppress hydration flash)

---

## Verdict

**The platform is at ~25% of functional MVP.** The visual design and route structure are solid. But the data layer is fake, most pages are stubs, and there's no real content pipeline. The good news: the architecture is right, so fixing this is additive work, not rewrite work. The path forward is clear.
