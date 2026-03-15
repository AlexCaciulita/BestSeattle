/**
 * SerpApi Google Events integration.
 * Fetches events from Google Events via SerpApi and normalizes to our Item shape.
 *
 * Budget: 250 queries/month (free tier).
 * Strategy: 6 targeted queries every 4 days = ~45 queries/month.
 */

import type { Item, ItemType } from "./items-repo";
import { normalizeEventCategory } from "./normalize-category";

const SERPAPI_BASE = "https://serpapi.com/search";

function getApiKey(): string {
  const key = process.env.SERPAPI_KEY;
  if (!key) throw new Error("SERPAPI_KEY is not set");
  return key;
}

// --- SerpApi response types ---

type SerpApiEventDate = {
  start_date?: string;
  when?: string;
};

type SerpApiVenue = {
  name?: string;
  rating?: number;
  reviews?: number;
  link?: string;
};

type SerpApiTicketInfo = {
  source?: string;
  link?: string;
  link_type?: string;
};

type SerpApiEvent = {
  title: string;
  date?: SerpApiEventDate;
  address?: string[];
  link?: string;
  description?: string;
  thumbnail?: string;
  image?: string;
  ticket_info?: SerpApiTicketInfo[];
  venue?: SerpApiVenue;
  event_location_map?: {
    image?: string;
    link?: string;
  };
};

type SerpApiResponse = {
  search_metadata?: { status?: string };
  events_results?: SerpApiEvent[];
  error?: string;
};

// --- Search queries for maximum Seattle coverage ---
// Each query targets a different category to diversify results.

export const SERPAPI_QUERIES = [
  { q: "events in Seattle this week", tag: "general" },
  { q: "concerts in Seattle this week", tag: "concerts" },
  { q: "comedy shows in Seattle this week", tag: "comedy" },
  { q: "art exhibitions in Seattle this week", tag: "arts" },
  { q: "food festivals in Seattle this week", tag: "food-drink" },
  { q: "family events in Seattle this week", tag: "family" },
] as const;

// --- Normalization helpers ---

/** Extract zone from address array */
function addressToZone(address?: string[]): string {
  if (!address || address.length === 0) return "Seattle";
  const full = address.join(" ").toLowerCase();
  if (full.includes("bellevue")) return "Bellevue";
  if (full.includes("redmond")) return "Redmond";
  if (full.includes("kirkland")) return "Kirkland";
  if (full.includes("tacoma")) return "Tacoma";
  if (full.includes("everett")) return "Everett";
  if (full.includes("bothell")) return "Bothell";
  if (full.includes("renton")) return "Renton";
  if (full.includes("kent")) return "Kent";
  if (full.includes("woodinville")) return "Woodinville";
  if (full.includes("capitol hill")) return "Capitol Hill";
  if (full.includes("ballard")) return "Ballard";
  if (full.includes("fremont")) return "Fremont";
  if (full.includes("queen anne")) return "Queen Anne";
  if (full.includes("west seattle")) return "West Seattle";
  if (full.includes("university district") || full.includes("u district")) return "U District";
  if (full.includes("georgetown")) return "Georgetown";
  if (full.includes("columbia city")) return "Columbia City";
  return "Seattle";
}

/** Parse SerpApi date to ISO starts_at string */
function parseSerpApiDate(date?: SerpApiEventDate): string | undefined {
  if (!date?.start_date) return undefined;
  // start_date is typically "Mon, Mar 17" or "2026-03-17" format
  try {
    const d = new Date(date.start_date);
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10) + "T19:00:00";
    }
  } catch {
    // Fall through to when field
  }

  // Try extracting from "when" field (e.g., "Saturday, March 15, 8 PM – 11 PM")
  if (date.when) {
    try {
      // Extract just the date part before any time/dash
      const datePart = date.when.split(/\s*[–—-]\s*/)[0].trim();
      const d = new Date(datePart);
      if (!isNaN(d.getTime())) {
        return d.toISOString().slice(0, 10) + "T19:00:00";
      }
    } catch {
      // Can't parse
    }
  }

  return undefined;
}

/** Determine timeframe from starts_at */
function getTimeframe(startsAt?: string): string {
  if (!startsAt) return "week";
  const eventDate = new Date(startsAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor(
    (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays <= 0) return "tonight";
  if (diffDays <= 2) return "weekend";
  return "week";
}

/** Try to extract a price from description or ticket info */
function extractPrice(event: SerpApiEvent): number {
  // Check description for price patterns
  const text = `${event.description ?? ""} ${event.title}`;
  const priceMatch = text.match(/\$\s?(\d{1,4})/);
  if (priceMatch) return parseInt(priceMatch[1], 10);

  // Check if "Free" is mentioned
  if (/\bfree\b/i.test(text)) return 0;

  return 40; // default estimate
}

/** Pick best ticket/booking URL */
function pickBookingUrl(event: SerpApiEvent): string | undefined {
  if (event.ticket_info && event.ticket_info.length > 0) {
    // Prefer direct ticket links
    const ticket = event.ticket_info.find((t) => t.link_type === "tickets") ?? event.ticket_info[0];
    return ticket?.link;
  }
  return event.link;
}

/** Pick best image URL */
function pickImage(event: SerpApiEvent): string {
  return event.image ?? event.thumbnail ?? "";
}

/** Generate a stable source_event_id from event data */
function generateSourceId(event: SerpApiEvent): string {
  const key = `${event.title}-${event.date?.start_date ?? ""}-${event.venue?.name ?? ""}`;
  // Simple hash for dedup
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
  }
  return `serpapi-${Math.abs(hash).toString(36)}`;
}

/** Normalize a single SerpApi event to our Item shape */
export function normalizeSerpApiEvent(event: SerpApiEvent, idx: number, queryTag: string): Item {
  const startsAt = parseSerpApiDate(event.date);
  const estPrice = extractPrice(event);

  // Use the keyword-based normalization (source: "serpapi" won't match TM-specific maps)
  const catResult = normalizeEventCategory(
    {
      source: "serpapi",
      tags: [queryTag],
    },
    event.title,
    event.venue?.name,
  );

  // If keyword matching returns "other" but we know the query tag, use it as a hint
  if (catResult.category_slug === "other" && queryTag !== "general") {
    const tagSlugMap: Record<string, string> = {
      concerts: "concerts",
      comedy: "comedy",
      arts: "arts",
      "food-drink": "food-drink",
      family: "family",
    };
    if (tagSlugMap[queryTag]) {
      catResult.category_slug = tagSlugMap[queryTag];
      catResult.category_label =
        catResult.category_slug.charAt(0).toUpperCase() +
        catResult.category_slug.slice(1).replace(/-/g, " & ");
      catResult.confidence = "medium";
    }
  }

  return {
    id: 5000 + idx,
    item_type: "event" as ItemType,
    title: event.title,
    source: "Google Events",
    source_event_id: generateSourceId(event),
    description: event.description ?? null,
    venue_name: event.venue?.name ?? null,
    lat: null,
    lng: null,
    price_min: estPrice > 0 ? estPrice : null,
    price_max: null,
    confidence: catResult.confidence,
    zone: addressToZone(event.address),
    category: catResult.category_label,
    category_slug: catResult.category_slug,
    subcategory_slug: catResult.subcategory_slug,
    source_category_raw: catResult.source_category_raw as Record<string, unknown>,
    score: null,
    sponsored: false,
    status: "approved",
    metadata: {
      est_price: estPrice,
      booking_url: pickBookingUrl(event),
      thumbnail_url: pickImage(event),
      city: addressToZone(event.address),
      timeframe: getTimeframe(startsAt),
      starts_at: startsAt,
      content_type: catResult.category_slug,
    },
  };
}

/** Fetch events for a single query from SerpApi */
async function fetchSerpApiQuery(
  query: string,
  tag: string,
  htichips?: string,
): Promise<Item[]> {
  const params = new URLSearchParams({
    engine: "google_events",
    q: query,
    hl: "en",
    gl: "us",
    api_key: getApiKey(),
  });

  if (htichips) {
    params.set("htichips", htichips);
  }

  const res = await fetch(`${SERPAPI_BASE}?${params}`, {
    next: { revalidate: 86400 }, // Cache for 24 hours
  });

  if (!res.ok) {
    console.error(`[SerpApi] API error: ${res.status} ${res.statusText}`);
    return [];
  }

  const data: SerpApiResponse = await res.json();

  if (data.error) {
    console.error(`[SerpApi] Error: ${data.error}`);
    return [];
  }

  const events = data.events_results ?? [];
  console.log(`[SerpApi] Query "${query}" returned ${events.length} events`);

  return events.map((ev, idx) => normalizeSerpApiEvent(ev, idx, tag));
}

/**
 * Fetch Seattle events from SerpApi using rotating queries.
 *
 * Budget: 250 queries/month (free tier).
 * With 3x/day cron = 90 syncs/month.
 * We run 2 queries per sync = 180 queries/month (well within budget).
 * Queries rotate so all 6 categories get covered every 3 syncs (1 day).
 */
export async function fetchAllSerpApiEvents(): Promise<Item[]> {
  const allItems: Item[] = [];
  const seen = new Set<string>();

  // Rotate: pick 2 queries based on current time slot
  // With 6 queries and 2 per sync, we cycle through all in 3 syncs (1 day)
  const syncIndex = Math.floor(Date.now() / 1000 / 3600) % 3; // changes every hour, mod 3
  const startIdx = syncIndex * 2;
  const selectedQueries = [
    SERPAPI_QUERIES[startIdx % SERPAPI_QUERIES.length],
    SERPAPI_QUERIES[(startIdx + 1) % SERPAPI_QUERIES.length],
  ];

  console.log(`[SerpApi] Sync slot ${syncIndex}, running queries: ${selectedQueries.map(q => q.tag).join(", ")}`);

  for (const { q, tag } of selectedQueries) {
    try {
      const items = await fetchSerpApiQuery(q, tag);

      for (const item of items) {
        // Deduplicate by title (normalized)
        const key = item.title.toLowerCase().trim();
        if (seen.has(key)) continue;
        seen.add(key);
        allItems.push(item);
      }
    } catch (err) {
      console.error(`[SerpApi] Failed query "${q}":`, err);
    }
  }

  // Re-index IDs
  const result = allItems.map((item, idx) => ({ ...item, id: 5000 + idx }));

  // Log category distribution
  const catCounts = new Map<string, number>();
  for (const item of result) {
    const slug = item.category_slug ?? "other";
    catCounts.set(slug, (catCounts.get(slug) ?? 0) + 1);
  }
  console.log(
    `[SerpApi] Fetched ${result.length} unique events. Categories:`,
    Object.fromEntries(catCounts),
  );

  return result;
}
