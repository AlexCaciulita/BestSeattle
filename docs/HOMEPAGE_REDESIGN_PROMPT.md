# Homepage Redesign Prompt for Claude Code

## Context
You're redesigning the homepage of BestSeattle.co — a curated city guide for Seattle restaurants, events, and experiences. The current design is generic, static, and looks like 2018. We need something that feels like 2026: alive, dynamic, and impossible to leave without engaging.

Tech stack: Next.js 14 App Router + Tailwind CSS + Supabase backend. Data comes from `getTonightBoard()` in `@/lib/tonight-repo.ts` which returns real-time categorized items (happeningNow, startingSoon, laterTonight, weekend, restaurants, heroPick).

## Design Philosophy
This is NOT a content website with a hero banner. This is a **living, breathing city pulse**. Think: what if Google Maps, Instagram Stories, and a concierge had a baby. The page should feel like opening an app that *knows* what's happening right now.

## Specific Design Direction

### 1. Kill the Hero Banner
No more giant static image with text overlay. Replace with one of:
- **A real-time "city pulse" strip** — a horizontally scrolling ticker showing what's literally happening RIGHT NOW in Seattle ("🔴 Live jazz at Dimitriou's · 47 people interested" / "🍽️ 3 tables left at Canlis tonight" / "🎭 Hamilton starts in 2h"). Think Bloomberg terminal meets nightlife.
- OR a **split-screen time-aware greeting**: Left side is a bold, dynamically generated message based on time of day ("It's 6PM. Seattle is waking up." / "Friday night. You need a plan." / "Sunday morning. Brunch first."). Right side shows the single best pick for RIGHT NOW with a full-bleed image, one-tap action.

### 2. Time-Aware Layout
The entire page should reshape based on when you visit:
- **Morning (6-11am)**: Lead with brunch spots + coffee, muted warm palette
- **Afternoon (11am-5pm)**: Lead with activities, outdoor experiences, family stuff
- **Evening (5-9pm)**: Lead with dinner reservations, tonight's events, date night picks
- **Night (9pm+)**: Dark mode auto-activates, lead with bars, late-night food, concerts happening NOW
- Show a subtle animated gradient background that shifts color with time of day (warm sunrise → bright midday → golden hour → deep night blue/purple)

### 3. "Happening Now" as the Core UI
Replace the static card grid with a **live feed aesthetic**:
- Items should have subtle pulse animations if they're happening NOW
- Countdown timers on upcoming events ("Starts in 47 min")
- Micro-interactions: cards that tilt slightly on hover (3D perspective transform), smooth spring animations
- Each card should feel like an Instagram story preview — tall aspect ratio, image-forward, minimal text overlay, swipeable on mobile

### 4. The "One-Tap Tonight" Widget
Above the fold, always visible: a compact, opinionated widget that says:
```
Tonight's #1 Pick
[Full-bleed image of venue]
[Event/Restaurant name]
[One-line pitch]
[→ Book Now / → Get Directions]
```
This is the heroPick from getTonightBoard(). One decision, zero scrolling. The fastest path from "I'm bored" to "I'm going."

### 5. Neighborhood Map (Interactive, Not Decorative)
Replace the zone cards grid with a **stylized, minimal SVG map of Seattle** neighborhoods:
- Hover a neighborhood → it glows, shows a count ("12 things tonight in Capitol Hill")
- Click → smooth morph transition into that neighborhood's feed
- Use a dark, abstract map style — not Google Maps. Think Mapbox dark theme or a custom illustrated outline
- Dots/pulses on the map showing where events are concentrated right now

### 6. Newsletter Capture — Embedded, Not Banner
Don't use a separate "newsletter section." Instead:
- Sticky floating pill at bottom of screen: "📩 Get Seattle's best picks every week" + email input + submit — minimal, non-intrusive, always visible
- OR an inline contextual prompt after the user scrolls past 3-4 items: "Like what you see? We send the 5 best every Tuesday + Friday." with a single email field
- No modals. No popups. No "subscribe to our newsletter" blocks.

### 7. Visual Language
- **Typography**: Use a modern variable font. Big, confident headlines (72-96px). Think Inter Variable or Geist for body, and something with personality for headlines — Clash Display, Cabinet Grotesk, or Satoshi
- **Colors**: Abandon the gold/black for something more sophisticated. Base: near-black (#0a0a0a) with an accent that shifts with time of day. Or go light with lots of white space and bold photographic content — like Apple's editorial style
- **Glass morphism is dead**. No frosted glass cards. Use sharp, confident containers. Thin 1px borders. Generous whitespace.
- **Motion**: Subtle parallax on scroll. Cards that fade-up on intersection. Smooth page transitions. Nothing flashy — everything purposeful. Use Framer Motion.
- **Photography**: Full-bleed images, not thumbnails in boxes. Let the food/venue photos DO the selling. Unsplash fallbacks are fine but prioritize real venue imagery when available.

### 8. Mobile-First (80%+ of your traffic)
- Bottom navigation bar (not top hamburger menu) — thumb-friendly
- Swipeable horizontal card rows (like Netflix/Uber Eats)
- Pull-to-refresh gesture
- The entire above-the-fold on mobile should be: greeting + tonight's #1 pick + "happening now" ticker. That's it. Everything else is below.

### 9. Social Proof / Activity Signals
- Show subtle activity indicators: "23 people viewed this today" or "Popular in Capitol Hill right now"
- If we have click data from `booking_clicks` table, surface it: "Trending 🔥"
- These don't need to be real at launch — can be seeded/estimated

### 10. The Scroll Narrative
Structure the page as a story, not a grid:
1. **Above fold**: Time-aware greeting + #1 pick + happening now ticker
2. **Section 2**: "Tonight" — horizontal scroll of tonight's events
3. **Section 3**: "This Weekend" — curated 3-5 picks with big images
4. **Section 4**: "Eat" — top restaurants, filterable by vibe (date night, casual, group)
5. **Section 5**: "Explore by Neighborhood" — interactive map or stylized zone selector
6. **Sticky bottom**: Newsletter capture pill

## What NOT to Do
- No generic stock photo hero banners
- No "Welcome to BestSeattle" copy
- No carousel/slider with arrows (it's 2026, use horizontal scroll with momentum)
- No card grids that look like Bootstrap templates
- No "Learn More" buttons — every CTA should be specific ("Book for tonight", "See 12 events", "Get directions")
- No separate "About" section on the homepage
- No social media icon row

## Reference Inspiration
- **bestdubai.com** — premium editorial tone (but our UX should be more dynamic)
- **Airbnb Experiences** — the card design and category browsing
- **Apple.com** — editorial confidence, typography scale, whitespace
- **Linear.app** — motion design, dark mode sophistication
- **Uber Eats** — mobile-first browse/discover UX, horizontal scrolling
- **Spotify's "Made For You"** — personalized, time-aware recommendations

## Implementation Notes
- Use existing `getTonightBoard()` for all data — it already returns happeningNow, startingSoon, laterTonight, weekend, restaurants, heroPick
- Use `getTimePeriodLabel()` from `@/lib/time-utils` for time-aware greetings
- Keep `revalidate = 300` (5 min) for ISR
- Framer Motion for animations (`npm install framer-motion` if not installed)
- The page should feel fast. Skeleton loaders for images. Optimistic UI. No layout shift.
- Prioritize mobile viewport. Desktop is a wider version of the same flow, not a different layout.
