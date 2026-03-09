# BestInSeattle — Design System

Last updated: 2026-03-08

---

## Color Tokens

All colors are defined as CSS variables in `site/src/app/globals.css` and registered via `@theme inline` for Tailwind utility usage.

| Token | Light | Dark (blackgold) | Usage |
|---|---|---|---|
| `--background` | `#faf9f6` | `#0c0c0c` | Page background |
| `--surface` | `#ffffff` | `#151515` | Cards, panels, inputs |
| `--foreground` | `#111111` | `#f5f5f5` | Primary text |
| `--muted` | `#5e5e5e` | `#b3b3b3` | Secondary text, metadata |
| `--border` | `#eae7df` | `#2a2a2a` | Borders, dividers |
| `--accent` | `#c9a227` | `#d4af37` | Gold accent, CTAs, active states |
| `--surface-hover` | `#f5f3ee` | `#1e1e1e` | Card hover state |
| `--placeholder-bg` | `#e5e2db` | `#222222` | Image placeholder background |
| `--score-bg` | `#1a8a3e` | `#16a34a` | Score badge circle |
| `--score-fg` | `#ffffff` | `#ffffff` | Score badge text |
| `--status-open` | `#16a34a` | `#22c55e` | "Open" indicator |
| `--status-closed` | `#dc2626` | `#ef4444` | "Closed" indicator |
| `--success` | `#16a34a` | `#22c55e` | Success messages |
| `--error` | `#dc2626` | `#ef4444` | Error messages |

---

## Typography

**Font:** Inter (loaded via Google Fonts)

| Element | Size | Weight | Usage |
|---|---|---|---|
| Page title (h1) | `text-4xl` / `text-5xl` | `font-semibold` | Page headings |
| Section title (h2) | `text-2xl` | `font-semibold` | Section headings |
| Card title | `text-base` / `text-lg` | `font-semibold` | Item names |
| Body text | `text-base` | normal | Paragraphs |
| Metadata | `text-sm` / `text-xs` | normal | Source, zone, price, category |
| Badge text | `text-xs` | `font-semibold` | Pills, badges |
| Uppercase label | `text-sm` + `uppercase tracking-[0.2em]` | normal | Subtitles, kickers |

---

## Card Variants

### Grid Card (default)
- Vertical layout: image on top, content below
- Image: `aspect-[4/3]`, `rounded-t-xl`, `object-cover`
- Score badge: `absolute bottom-2 right-2`, 40px green circle
- Quality badges: `absolute left-2 top-2`
- Content padding: `p-4`
- Title: single line with `line-clamp-1`
- Metadata: location pin icon + zone, price dollars + cuisine
- CTA: rounded-full button

### List Card
- Horizontal layout: image left (220px), content right
- Image: full height, `rounded-l-xl`
- Same badge/metadata pattern as grid
- Content padding: `p-5`

### Grid layouts
- 3 columns on `lg:`: `grid lg:grid-cols-3 gap-4`
- 2 columns on `sm:`: `sm:grid-cols-2`
- 1 column on mobile: stacked

---

## Score Badge

Component: `src/components/score-badge.tsx`

| Variant | Size | Usage |
|---|---|---|
| `sm` (default) | `h-10 w-10 text-sm` | Cards |
| `lg` | `h-14 w-14 text-lg` | Detail page hero |

- Background: `bg-score-bg` (green)
- Text: `text-score-fg` (white), `font-bold`
- Format: one decimal (e.g., "8.9")
- Renders nothing if score is null

---

## Quality Badge Pills

Component: `src/components/quality-badge.tsx`

| Badge | Condition | Style |
|---|---|---|
| Best 100 | `quality_score >= 90` | `bg-amber-600 text-white` |
| Gem | `quality_score >= 80` | `bg-violet-600 text-white` |
| Sponsored | `sponsored: true` | `border-accent text-accent bg-black/40` |

- Positioned: `absolute left-2 top-2` on card images
- Size: `px-2.5 py-0.5 text-xs font-semibold rounded-full`

---

## Filter Sidebar

Component: `src/components/filter-sidebar.tsx`

- Desktop: `w-[220px]`, sticky, visible on `lg:` breakpoint
- Mobile: collapsed behind "Filters" button
- Filter groups: Type, Cuisine, Price Range, Min Rating, Neighborhood
- Each group is a `<fieldset>` with `<legend>`
- Checkboxes for multi-select, pill buttons for rating

---

## Breadcrumbs

Component: `src/components/breadcrumbs.tsx`

- Format: `Home > Section > Current Page`
- Separator: `>`
- Last segment: plain text with `text-foreground`
- Previous segments: links with `hover:text-foreground`
- Size: `text-sm text-muted`

---

## Buttons

| Style | Class | Usage |
|---|---|---|
| Primary | `bg-accent rounded-full text-black font-semibold` | Main CTAs, book buttons |
| Secondary | `border border-border rounded-full font-semibold` | Secondary actions |
| Ghost | `border border-border text-muted hover:text-accent` | Tertiary, "View Details" |
| Filter active | `border-accent bg-accent/10 text-accent` | Active filter state |
| Filter inactive | `border-border text-muted hover:text-foreground` | Inactive filter |

---

## Spacing Conventions

| Context | Value |
|---|---|
| Page horizontal padding | `px-6` |
| Page max width | `max-w-6xl` (1152px) |
| Section gap (vertical) | `mt-8` to `mt-10` |
| Card grid gap | `gap-4` |
| Card content padding | `p-4` (grid), `p-5` (list) |
| Filter sidebar width | `220px` |
| Sidebar-to-content gap | `gap-8` |

---

## Image Guidelines

- Aspect ratio: `4/3` for cards, `3/2` for zone thumbnails, `16/9` for hero
- All external images use `unoptimized` flag (Unsplash/editorial sources)
- Fallback: `ImagePlaceholder` component with type-specific icon
- Category overlay cards: gradient `from-black/70 via-black/20 to-transparent`
- Hover: `group-hover:scale-105` with `transition-transform duration-300`

---

## Theme Toggle

- Stored in `localStorage.bis_theme`
- Sets `data-theme` attribute on `<html>`
- Smooth transition: `body { transition: background-color 0.3s, color 0.3s }`
- All components must use CSS variable tokens — never hardcode colors

---

## Listing Page Pattern

Used by: `/best-of/[slug]`, `/zones/[slug]`, `/events`, `/events/this-weekend`

Structure:
1. Breadcrumbs
2. Item count header + search bar + view toggle (flex row)
3. Two-column layout: filter sidebar (left) + item grid (right)
4. Mobile: sidebar collapses, grid becomes single column

Component: `src/components/listing-layout.tsx`
