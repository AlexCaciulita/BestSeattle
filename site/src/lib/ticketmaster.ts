/**
 * Ticketmaster Discovery API integration.
 * Fetches events for Seattle + Eastside and normalizes them to our Item shape.
 */

import type { Item, ItemType } from "./items-repo";
import { normalizeEventCategory } from "./normalize-category";

const API_BASE = "https://app.ticketmaster.com/discovery/v2";

function getApiKey(): string {
  const key = process.env.TICKETMASTER_API_KEY;
  if (!key) throw new Error("TICKETMASTER_API_KEY is not set");
  return key;
}

export type TmEvent = {
  id: string;
  name: string;
  url: string;
  info?: string;
  pleaseNote?: string;
  dates: {
    start: { localDate?: string; localTime?: string };
    status?: { code?: string };
  };
  images: { url: string; ratio: string; width: number }[];
  classifications?: {
    segment?: { name: string };
    genre?: { name: string };
    subGenre?: { name: string };
  }[];
  priceRanges?: { min?: number; max?: number }[];
  _embedded?: {
    venues?: {
      name: string;
      city?: { name: string };
      state?: { stateCode: string };
      address?: { line1: string };
      location?: { latitude: string; longitude: string };
    }[];
  };
};

type TmVenue = NonNullable<NonNullable<TmEvent["_embedded"]>["venues"]>[number];

/** Map Ticketmaster venue city to our zone system */
function venueToZone(venue?: TmVenue): string {
  if (!venue) return "Seattle Core";
  const city = venue.city?.name?.toLowerCase() ?? "";
  if (city.includes("bellevue")) return "Bellevue";
  if (city.includes("redmond")) return "Redmond";
  if (city.includes("kirkland")) return "Kirkland";
  if (city.includes("tacoma")) return "Tacoma";
  if (city.includes("everett")) return "Everett";
  return "Seattle Core";
}

/** Pick the best image (prefer 4:3, fallback to largest 16:9) */
function pickImage(images: TmEvent["images"]): string {
  const img4x3 = images.find((i) => i.ratio === "4_3");
  if (img4x3) return img4x3.url;
  const sorted = [...images].sort((a, b) => b.width - a.width);
  return sorted[0]?.url ?? "";
}

/** Determine timeframe relative to today */
function getTimeframe(dateStr?: string): string {
  if (!dateStr) return "week";
  const eventDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor(
    (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "tonight";
  if (diffDays <= 2) return "weekend";
  return "week";
}

export function normalizeEvent(ev: TmEvent, idx: number): Item {
  const venue = ev._embedded?.venues?.[0];
  const classification = ev.classifications?.[0];
  const segment = classification?.segment?.name ?? "Other";
  const genre = classification?.genre?.name ?? "";
  const subGenre = classification?.subGenre?.name ?? "";
  const priceRange = ev.priceRanges?.[0];
  const estPrice =
    priceRange?.min ?? (priceRange?.max ? Math.round(priceRange.max / 2) : 40);

  // Run through canonical normalization pipeline
  const catResult = normalizeEventCategory(
    {
      source: "ticketmaster",
      segment,
      genre,
      subGenre,
    },
    ev.name,
    venue?.name,
  );

  const description = [ev.info, ev.pleaseNote].filter(Boolean).join(" — ") || null;
  const lat = venue?.location?.latitude ? parseFloat(venue.location.latitude) : null;
  const lng = venue?.location?.longitude ? parseFloat(venue.location.longitude) : null;

  return {
    id: 2000 + idx,
    item_type: "event" as ItemType,
    title: ev.name,
    source: "Ticketmaster",
    source_event_id: ev.id,
    description,
    venue_name: venue?.name ?? null,
    lat: lat && !isNaN(lat) ? lat : null,
    lng: lng && !isNaN(lng) ? lng : null,
    price_min: priceRange?.min ?? null,
    price_max: priceRange?.max ?? null,
    confidence: catResult.confidence,
    zone: venueToZone(venue),
    category: catResult.category_label,
    category_slug: catResult.category_slug,
    subcategory_slug: catResult.subcategory_slug,
    source_category_raw: catResult.source_category_raw as Record<string, unknown>,
    score: null,
    sponsored: false,
    status: "approved",
    metadata: {
      est_price: estPrice,
      booking_url: ev.url,
      thumbnail_url: pickImage(ev.images),
      city: venue?.city?.name ?? "Seattle",
      timeframe: getTimeframe(ev.dates.start.localDate),
      starts_at: ev.dates.start.localDate
        ? `${ev.dates.start.localDate}T${ev.dates.start.localTime ?? "19:00:00"}`
        : undefined,
      content_type: segment.toLowerCase(),
    },
  };
}

export type FetchOptions = {
  city?: string;
  stateCode?: string;
  size?: number;
  segmentName?: string;
  sort?: string;
  startDateTime?: string;
  endDateTime?: string;
  page?: number;
};

export async function fetchTicketmasterEvents(
  opts: FetchOptions = {},
): Promise<Item[]> {
  const params = new URLSearchParams({
    apikey: getApiKey(),
    city: opts.city ?? "Seattle",
    stateCode: opts.stateCode ?? "WA",
    size: String(opts.size ?? 50),
    sort: opts.sort ?? "date,asc",
  });

  if (opts.segmentName) params.set("segmentName", opts.segmentName);
  if (opts.startDateTime) params.set("startDateTime", opts.startDateTime);
  if (opts.endDateTime) params.set("endDateTime", opts.endDateTime);
  if (opts.page) params.set("page", String(opts.page));

  let res: Response | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    res = await fetch(`${API_BASE}/events.json?${params}`, {
      next: { revalidate: 3600 },
    });
    if (res.status === 429) {
      const wait = (attempt + 1) * 2000;
      console.warn(`[Ticketmaster] 429 rate limited, retrying in ${wait}ms...`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    break;
  }

  if (!res || !res.ok) {
    console.error(`Ticketmaster API error: ${res?.status} ${res?.statusText}`);
    return [];
  }

  const data = await res.json();
  const events: TmEvent[] = data._embedded?.events ?? [];
  return events.map((ev, idx) => normalizeEvent(ev, idx));
}

/** Fetch events from multiple cities (Seattle, Bellevue, Tacoma) */
export async function fetchAllSeattleAreaEvents(
  size = 50,
): Promise<Item[]> {
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const shared: FetchOptions = {
    startDateTime: now,
    segmentName: "Music,Sports,Arts & Theatre,Film,Miscellaneous",
  };

  // Serialize requests to avoid Ticketmaster 429 rate limits
  const seattle = await fetchTicketmasterEvents({ ...shared, city: "Seattle", size });
  const bellevue = await fetchTicketmasterEvents({
    ...shared,
    city: "Bellevue",
    size: Math.round(size / 3),
  });
  const tacoma = await fetchTicketmasterEvents({
    ...shared,
    city: "Tacoma",
    size: Math.round(size / 3),
  });

  // Deduplicate by event name + date
  const seen = new Set<string>();
  const all = [...seattle, ...bellevue, ...tacoma].filter((item) => {
    const key = `${item.title}-${item.metadata?.starts_at?.slice(0, 10)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Log category distribution
  const catCounts = new Map<string, number>();
  for (const item of all) {
    const slug = item.category_slug ?? "other";
    catCounts.set(slug, (catCounts.get(slug) ?? 0) + 1);
  }
  console.log(
    `[Ticketmaster] Fetched ${all.length} events. Categories:`,
    Object.fromEntries(catCounts),
  );

  // Re-index IDs
  return all.map((item, idx) => ({ ...item, id: 2000 + idx }));
}
