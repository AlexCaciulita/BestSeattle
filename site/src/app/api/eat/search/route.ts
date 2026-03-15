import { NextRequest, NextResponse } from "next/server";
import { searchGrouped, sortRestaurants } from "@/lib/eat-repo";
import { getCacheKey, getCached, setCache } from "@/lib/eat-cache";
import type { CuisineFilter, EatSortOption } from "@/lib/eat-types";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const lat = parseFloat(sp.get("lat") ?? "47.6062");
  const lng = parseFloat(sp.get("lng") ?? "-122.3321");
  const radius = parseInt(sp.get("radius") ?? "5000", 10);
  const cuisine = (sp.get("cuisine") ?? "all") as CuisineFilter;
  const sort = (sp.get("sort") ?? "rating") as EatSortOption;
  const limit = parseInt(sp.get("limit") ?? "20", 10);

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ ok: false, error: "Invalid lat/lng" }, { status: 400 });
  }

  const cacheKey = getCacheKey(lat, lng, cuisine, radius);
  const cached = getCached(cacheKey);

  if (cached) {
    return NextResponse.json({
      ok: true,
      restaurants: sortRestaurants(cached.restaurants, sort).slice(0, limit),
      coffee: sortRestaurants(cached.coffee, sort).slice(0, limit),
      bars: sortRestaurants(cached.bars, sort).slice(0, limit),
      cached: true,
    });
  }

  const grouped = await searchGrouped({
    lat,
    lng,
    radiusMeters: Math.min(radius, 50000),
    cuisine,
    sort: "distance",
    maxResults: 20,
  });

  setCache(cacheKey, grouped);

  return NextResponse.json({
    ok: true,
    restaurants: sortRestaurants(grouped.restaurants, sort).slice(0, limit),
    coffee: sortRestaurants(grouped.coffee, sort).slice(0, limit),
    bars: sortRestaurants(grouped.bars, sort).slice(0, limit),
    cached: false,
  });
}
