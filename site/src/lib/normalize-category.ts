/**
 * Reusable event category normalization pipeline.
 *
 * Takes raw source category data + event metadata and produces a canonical
 * category assignment. Works for any provider (Ticketmaster, Eventbrite, etc.).
 *
 * Provider adapters:
 * - Each provider extracts raw classification fields and passes them here.
 * - This module is provider-agnostic; provider-specific mapping tables live
 *   in event-categories.ts (TM_SEGMENT_MAP, etc.).
 *
 * Future providers:
 * - TODO: Eventbrite adapter — map format/category/subcategory fields
 * - TODO: Meetup adapter — map group topics + event type
 */

import {
  EVENT_CATEGORIES,
  TM_SEGMENT_MAP,
  TM_SUBCATEGORY_MAP,
  CATEGORY_BY_SLUG,
} from "./event-categories";

export type RawCategoryPayload = {
  /** Provider name: "ticketmaster", "eventbrite", "meetup", etc. */
  source: string;
  /** Ticketmaster: segment name */
  segment?: string;
  /** Ticketmaster: genre name */
  genre?: string;
  /** Ticketmaster: subGenre name */
  subGenre?: string;
  /** Generic: any additional type/format labels */
  tags?: string[];
};

export type CategoryResult = {
  category_slug: string;
  category_label: string;
  subcategory_slug: string | null;
  confidence: "high" | "medium" | "low";
  source_category_raw: RawCategoryPayload;
};

/**
 * Normalize an event's category from source-specific data.
 *
 * Resolution order:
 * 1. Source-native mapping (e.g. TM segment/genre tables)
 * 2. Keyword-based fallback from title/venueName
 * 3. Default to "other" with low confidence
 */
export function normalizeEventCategory(
  raw: RawCategoryPayload,
  title: string,
  venueName?: string,
): CategoryResult {
  const result: CategoryResult = {
    category_slug: "other",
    category_label: "Other",
    subcategory_slug: null,
    confidence: "low",
    source_category_raw: raw,
  };

  // --- Step 1: Source-native mapping ---
  if (raw.source === "ticketmaster" || raw.source === "Ticketmaster") {
    const mapped = mapTicketmaster(raw);
    if (mapped) {
      result.category_slug = mapped.slug;
      result.category_label = CATEGORY_BY_SLUG.get(mapped.slug)?.label ?? mapped.slug;
      result.subcategory_slug = mapped.subcategory;
      result.confidence = mapped.confidence;

      // If high confidence, we're done
      if (result.confidence === "high") return result;
    }
  }

  // --- Step 2: Keyword fallback (if still low confidence or "other") ---
  if (result.confidence === "low" || result.category_slug === "other") {
    const keywordMatch = matchByKeywords(title, venueName);
    if (keywordMatch) {
      result.category_slug = keywordMatch.slug;
      result.category_label = CATEGORY_BY_SLUG.get(keywordMatch.slug)?.label ?? keywordMatch.slug;
      result.confidence = "medium";
    }
  }

  // --- Step 3: Ensure label is set ---
  if (result.category_slug !== "other") {
    result.category_label = CATEGORY_BY_SLUG.get(result.category_slug)?.label ?? result.category_label;
  }

  return result;
}

// --- Internal helpers ---

type MapResult = { slug: string; subcategory: string | null; confidence: "high" | "medium" };

function mapTicketmaster(raw: RawCategoryPayload): MapResult | null {
  const segment = raw.segment?.toLowerCase() ?? "";
  const genre = raw.genre?.toLowerCase() ?? "";

  // Try genre first (more specific), skip generic "other"/"undefined"
  if (genre && genre !== "undefined" && genre !== "other") {
    const slugFromGenre = TM_SEGMENT_MAP[genre];
    if (slugFromGenre && slugFromGenre !== "other") {
      return {
        slug: slugFromGenre,
        subcategory: TM_SUBCATEGORY_MAP[genre] ?? null,
        confidence: "high",
      };
    }
  }

  // Fall back to segment
  if (segment && segment !== "undefined") {
    const slugFromSegment = TM_SEGMENT_MAP[segment];
    if (slugFromSegment && slugFromSegment !== "other") {
      return {
        slug: slugFromSegment,
        subcategory: null,
        confidence: "medium",
      };
    }
  }

  return null;
}

function matchByKeywords(title: string, venueName?: string): { slug: string } | null {
  const text = `${title} ${venueName ?? ""}`.toLowerCase();

  for (const cat of EVENT_CATEGORIES) {
    if (cat.slug === "other") continue;
    for (const kw of cat.keywords) {
      // Use word-boundary matching for short keywords to avoid false positives
      // e.g. "class" shouldn't match "classifiable"
      if (kw.length <= 5) {
        const re = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
        if (re.test(text)) return { slug: cat.slug };
      } else {
        if (text.includes(kw)) return { slug: cat.slug };
      }
    }
  }

  return null;
}
