import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/nearby/track
 * Receives analytics events from the Near Me feature.
 * For now, logs to stdout. Can be extended to write to Supabase.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[nearby-analytics]", JSON.stringify(body));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
