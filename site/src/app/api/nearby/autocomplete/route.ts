import { NextRequest, NextResponse } from "next/server";
import { autocompletePlaces } from "@/lib/google-places";

/**
 * GET /api/nearby/autocomplete?q=Capitol+Hill&lat=47.6&lng=-122.3
 * Proxies Google Places Autocomplete to keep API key server-side.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q") ?? "";
  const lat = parseFloat(sp.get("lat") ?? "47.6062");
  const lng = parseFloat(sp.get("lng") ?? "-122.3321");

  if (!q.trim()) {
    return NextResponse.json({ ok: true, results: [] });
  }

  const results = await autocompletePlaces(q, lat, lng);
  return NextResponse.json({ ok: true, results });
}
