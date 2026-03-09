import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient, hasSupabaseConfig } from "@/lib/supabase";

/**
 * POST /api/booking-click
 * Track outbound clicks to booking/affiliate URLs for revenue attribution.
 * Body: { item_id: number, destination_url: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const itemId = body?.item_id;
    const destinationUrl = body?.destination_url;

    if (!destinationUrl) {
      return NextResponse.json({ ok: false, error: "destination_url required" }, { status: 400 });
    }

    if (hasSupabaseConfig()) {
      const supabase = getSupabaseClient();
      await supabase.from("booking_clicks").insert({
        item_id: itemId ?? null,
        destination_url: destinationUrl,
        referrer: req.headers.get("referer") ?? null,
        clicked_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
