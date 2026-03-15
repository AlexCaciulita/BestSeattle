/**
 * Geo-based search repository.
 * Queries items_curated using PostGIS earthdistance for radius-based search.
 */

import { getSupabaseClient, hasSupabaseConfig } from "@/lib/supabase";
import type { Item } from "@/lib/items-repo";

export type NearbyResult = Item & {
  distance_km: number;
};

export type NearbySearchParams = {
  lat: number;
  lng: number;
  radiusKm?: number;
  categories?: string[];
  itemTypes?: string[];
  priceMax?: number;
  timeStart?: string;
  timeEnd?: string;
  sort?: "distance" | "date" | "rating" | "relevance";
  limit?: number;
  offset?: number;
};

export type NearbySearchResult = {
  items: NearbyResult[];
  total: number;
  facets: Record<string, number>;
};

export async function searchNearby(
  params: NearbySearchParams,
): Promise<NearbySearchResult> {
  const {
    lat,
    lng,
    radiusKm = 10,
    categories,
    itemTypes,
    priceMax,
    timeStart,
    timeEnd,
    sort = "distance",
    limit = 50,
    offset = 0,
  } = params;

  if (!hasSupabaseConfig()) {
    return { items: [], total: 0, facets: {} };
  }

  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc("nearby_items", {
    p_lat: lat,
    p_lng: lng,
    p_radius_km: radiusKm,
    p_categories: categories?.length ? categories : null,
    p_item_types: itemTypes?.length ? itemTypes : null,
    p_price_max: priceMax ?? null,
    p_time_start: timeStart ?? null,
    p_time_end: timeEnd ?? null,
    p_sort: sort,
    p_limit: limit,
    p_offset: offset,
  });

  if (error) {
    console.error("[nearby-repo] RPC error:", error.message);
    return { items: [], total: 0, facets: {} };
  }

  const items: NearbyResult[] = (data ?? []).map((row: Record<string, unknown>) => ({
    ...row,
    zone: (row.zone as string) ?? "Seattle",
    category: (row.category as string) ?? "General",
    source: (row.source as string) ?? "BestInSeattle",
    distance_km: row.distance_km as number,
  })) as NearbyResult[];

  // Build facets (category counts)
  const facets: Record<string, number> = {};
  for (const item of items) {
    const slug = item.category_slug ?? "other";
    facets[slug] = (facets[slug] ?? 0) + 1;
  }

  return { items, total: items.length, facets };
}

/** Convert km to miles for display */
export function kmToMiles(km: number): number {
  return km * 0.621371;
}

/** Format distance for display */
export function formatDistance(km: number): string {
  const miles = kmToMiles(km);
  if (miles < 0.1) return "< 0.1 mi";
  if (miles < 1) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}
