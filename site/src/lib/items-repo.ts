/**
 * Unified data access layer for items_curated.
 * Single source of truth — all pages use this instead of reading JSON files directly.
 */

import { getSupabaseClient, hasSupabaseConfig } from "@/lib/supabase";
import { getSeedEvents, getSeedRestaurants } from "@/lib/data";

export type ItemType = "event" | "restaurant" | "place";
export type ItemStatus = "pending" | "approved" | "published" | "rejected";

export type Item = {
  id: number;
  item_type: ItemType;
  title: string;
  source: string;
  zone: string;
  /** Display label (e.g. "Rock", "Comedy", "Sushi") */
  category: string;
  /** Canonical slug for filtering (e.g. "concerts", "comedy", "sports") */
  category_slug?: string;
  /** Subcategory slug for finer grain (e.g. "rock", "hockey") */
  subcategory_slug?: string | null;
  /** Raw category data from the source provider, for debugging */
  source_category_raw?: Record<string, unknown> | null;
  /** Provider's native event ID (e.g. TM event ID) */
  source_event_id?: string | null;
  /** Event description / info text */
  description?: string | null;
  /** Venue name */
  venue_name?: string | null;
  /** Latitude */
  lat?: number | null;
  /** Longitude */
  lng?: number | null;
  /** Minimum ticket price */
  price_min?: number | null;
  /** Maximum ticket price */
  price_max?: number | null;
  /** Categorization confidence: "high" | "medium" | "low" */
  confidence?: string | null;
  score: number | null;
  sponsored: boolean;
  status: ItemStatus;
  metadata: {
    est_price?: number;
    booking_url?: string;
    thumbnail_url?: string;
    city?: string;
    content_type?: string;
    timeframe?: string;
    starts_at?: string;
    quality_score?: number;
  } | null;
};

type Filters = {
  types?: ItemType[];
  statuses?: ItemStatus[];
  zones?: string[];
  categories?: string[];
  cities?: string[];
  limit?: number;
  publicOnly?: boolean; // shorthand: only approved + published
};

function fallbackThumb(itemType: ItemType, category: string): string {
  if (itemType === "restaurant") {
    return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80";
  }
  const c = category.toLowerCase();
  if (c.includes("family")) return "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80";
  if (c.includes("play") || c.includes("music")) return "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80";
  return "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80";
}

function localFallback(filters: Filters): Item[] {
  const events: Item[] = getSeedEvents().map((e, idx) => ({
    id: idx + 1,
    item_type: "event",
    title: e.title,
    source: e.source,
    zone: e.zone ?? "Seattle",
    category: e.category,
    score: null,
    sponsored: e.sponsored ?? false,
    status: "approved" as ItemStatus,
    metadata: {
      est_price: e.est_price ?? 30,
      timeframe: e.timeframe ?? "week",
      starts_at: e.starts_at,
      thumbnail_url: e.thumbnail_url ?? fallbackThumb("event", e.category),
      city: "Seattle",
      content_type: "events",
    },
  }));

  const restaurants: Item[] = getSeedRestaurants().map((r, idx) => ({
    id: 100 + idx,
    item_type: "restaurant",
    title: r.name,
    source: r.editorial_source,
    zone: r.zone_hint,
    category: r.cuisine,
    score: r.editorial_score_raw,
    sponsored: r.sponsored ?? false,
    status: "approved" as ItemStatus,
    metadata: {
      est_price: 40,
      timeframe: "week",
      thumbnail_url: fallbackThumb("restaurant", r.cuisine),
      city: "Seattle",
      content_type: "restaurants",
    },
  }));

  let items = [...events, ...restaurants];

  if (filters.types?.length) {
    items = items.filter((i) => filters.types!.includes(i.item_type));
  }
  if (filters.zones?.length) {
    items = items.filter((i) =>
      filters.zones!.some((z) => i.zone.toLowerCase().includes(z.toLowerCase())),
    );
  }
  if (filters.categories?.length) {
    items = items.filter((i) =>
      filters.categories!.some((c) => i.category.toLowerCase().includes(c.toLowerCase())),
    );
  }

  return items.slice(0, filters.limit ?? 200);
}

export async function getItems(filters: Filters = {}): Promise<Item[]> {
  if (!hasSupabaseConfig()) return localFallback(filters);

  const supabase = getSupabaseClient();
  let query = supabase
    .from("items_curated")
    .select("id,item_type,title,source,zone,category,category_slug,subcategory_slug,source_category_raw,source_event_id,description,venue_name,lat,lng,price_min,price_max,confidence,score,sponsored,status,metadata")
    .order("id", { ascending: false })
    .limit(filters.limit ?? 200);

  const statuses = filters.publicOnly
    ? ["approved", "published"]
    : filters.statuses?.length
      ? filters.statuses
      : ["approved", "published"];

  query = query.in("status", statuses);

  if (filters.types?.length) {
    query = query.in("item_type", filters.types);
  }

  const { data, error } = await query;
  if (error) throw error;

  let items = ((data ?? []) as Item[]).map((row) => ({
    ...row,
    zone: row.zone ?? "Seattle",
    category: row.category ?? "General",
    source: row.source ?? "BestInSeattle",
    metadata: {
      ...row.metadata,
      thumbnail_url:
        row.metadata?.thumbnail_url ?? fallbackThumb(row.item_type, row.category ?? "General"),
    },
  }));

  // Apply client-side filters that Supabase can't handle well with jsonb
  if (filters.zones?.length) {
    items = items.filter((i) =>
      filters.zones!.some((z) => i.zone.toLowerCase().includes(z.toLowerCase())),
    );
  }
  if (filters.categories?.length) {
    items = items.filter((i) =>
      filters.categories!.some((c) => i.category.toLowerCase().includes(c.toLowerCase())),
    );
  }
  if (filters.cities?.length) {
    items = items.filter((i) =>
      filters.cities!.some((c) => (i.metadata?.city ?? "").toLowerCase().includes(c.toLowerCase())),
    );
  }

  if (items.length === 0) return localFallback(filters);

  return items;
}

export async function getItemById(id: number): Promise<Item | null> {
  if (!hasSupabaseConfig()) {
    const all = localFallback({});
    return all.find((i) => i.id === id) ?? null;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("items_curated")
    .select("id,item_type,title,source,zone,category,category_slug,subcategory_slug,source_category_raw,source_event_id,description,venue_name,lat,lng,price_min,price_max,confidence,score,sponsored,status,metadata")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  const row = data as Item;
  return {
    ...row,
    zone: row.zone ?? "Seattle",
    category: row.category ?? "General",
    source: row.source ?? "BestInSeattle",
    metadata: {
      ...row.metadata,
      thumbnail_url:
        row.metadata?.thumbnail_url ?? fallbackThumb(row.item_type, row.category ?? "General"),
    },
  };
}
