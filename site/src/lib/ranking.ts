import type { TonightItem } from "@/lib/tonight-repo";

/**
 * Score a single item for "top pick" ranking (0–100).
 *
 * Higher = more worthy of being featured on the homepage.
 */
export function scoreItem(item: TonightItem): number {
  let score = 0;

  // Time urgency (max 30) — events happening sooner are more interesting
  switch (item.timeWindow) {
    case "now":
      score += 30;
      break;
    case "soon":
      score += 25;
      break;
    case "tonight":
      score += 20;
      break;
    case "tomorrow":
      score += 12;
      break;
    case "weekend":
      score += 8;
      break;
    case "week":
      score += 4;
      break;
    default:
      score += 2;
  }

  // Has a real source image, not an Unsplash fallback (max 20)
  if (item.hasOriginalImage) score += 20;

  // Has a booking URL — actionable items are more valuable (max 15)
  if (item.bookingUrl) score += 15;

  // Has a named venue — signals an established event (max 10)
  if (item.venueName) score += 10;

  // Has real price data, not the default $40 (max 10)
  if (item.estPrice > 0 && item.estPrice !== 40) score += 10;

  // Well-categorized event (max 10)
  if (item.categorySlug && item.categorySlug !== "other") score += 10;

  // Sponsored boost (max 5)
  if (item.sponsored) score += 5;

  return score;
}

/**
 * Pick the best items for the featured bento grid with category diversity.
 *
 * Ensures the grid shows different types of events (not 4 concerts).
 */
export function pickFeatured(
  items: TonightItem[],
  count: number,
): TonightItem[] {
  if (items.length === 0) return [];

  const scored = items.map((item) => ({ item, score: scoreItem(item) }));
  scored.sort((a, b) => b.score - a.score);

  const picked: TonightItem[] = [];
  const usedCategories = new Set<string>();

  // First pass: pick diverse categories
  for (const { item } of scored) {
    if (picked.length >= count) break;

    if (picked.length === 0) {
      // Always pick the highest-scored item first (hero)
      picked.push(item);
      if (item.categorySlug) usedCategories.add(item.categorySlug);
      continue;
    }

    // Skip items with the same category as already-picked
    if (item.categorySlug && usedCategories.has(item.categorySlug)) continue;

    picked.push(item);
    if (item.categorySlug) usedCategories.add(item.categorySlug);
  }

  // Backfill if diversity constraint was too strict
  if (picked.length < count) {
    for (const { item } of scored) {
      if (picked.length >= count) break;
      if (!picked.some((p) => p.id === item.id)) {
        picked.push(item);
      }
    }
  }

  return picked;
}

/**
 * Pick trending items, excluding already-featured ones.
 *
 * No diversity constraint — if the best remaining items are all concerts, that's fine.
 */
export function pickTrending(
  items: TonightItem[],
  excludeIds: Set<string>,
  count: number,
): TonightItem[] {
  const remaining = items.filter((item) => !excludeIds.has(item.id));
  const scored = remaining.map((item) => ({ item, score: scoreItem(item) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map((s) => s.item);
}
