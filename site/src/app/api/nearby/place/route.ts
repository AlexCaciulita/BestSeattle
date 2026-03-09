import { NextRequest, NextResponse } from "next/server";
import { getPlaceDetails } from "@/lib/google-places";

/**
 * GET /api/nearby/place?id=ChIJ...
 * Get lat/lng for a Google Place ID.
 */
export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get("id");
  if (!placeId) {
    return NextResponse.json({ ok: false, error: "id is required" }, { status: 400 });
  }

  const result = await getPlaceDetails(placeId);
  if (!result) {
    return NextResponse.json({ ok: false, error: "Place not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, ...result });
}
