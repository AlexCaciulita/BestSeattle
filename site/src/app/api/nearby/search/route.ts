import { NextRequest, NextResponse } from "next/server";
import { searchNearby } from "@/lib/nearby-repo";

/**
 * GET /api/nearby/search?lat=47.6&lng=-122.3&radius=10&categories=concerts,comedy&sort=distance&limit=50&offset=0
 *
 * Returns internal DB events/places (Ticketmaster imports + curated items).
 * Google Places is only used for location autocomplete, not for search results.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const lat = parseFloat(sp.get("lat") ?? "");
  const lng = parseFloat(sp.get("lng") ?? "");

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { ok: false, error: "lat and lng are required" },
      { status: 400 },
    );
  }

  const radiusKm = parseFloat(sp.get("radius") ?? "10");
  const categories = sp.get("categories")?.split(",").filter(Boolean) ?? undefined;
  const itemTypes = sp.get("types")?.split(",").filter(Boolean) ?? undefined;
  const priceMax = sp.get("priceMax") ? parseFloat(sp.get("priceMax")!) : undefined;
  const timeStart = sp.get("timeStart") ?? undefined;
  const timeEnd = sp.get("timeEnd") ?? undefined;
  const sort = (sp.get("sort") ?? "distance") as "distance" | "date" | "rating" | "relevance";
  const limit = parseInt(sp.get("limit") ?? "50", 10);
  const offset = parseInt(sp.get("offset") ?? "0", 10);

  const result = await searchNearby({
    lat,
    lng,
    radiusKm,
    categories,
    itemTypes,
    priceMax,
    timeStart,
    timeEnd,
    sort,
    limit,
    offset,
  });

  return NextResponse.json({
    ok: true,
    ...result,
    page: Math.floor(offset / limit) + 1,
    hasMore: result.items.length === limit,
  });
}
