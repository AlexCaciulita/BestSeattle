import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient, hasSupabaseConfig } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Valid email required" }, { status: 400 });
    }

    if (!hasSupabaseConfig()) {
      // Accept silently in dev mode
      return NextResponse.json({ ok: true, message: "Subscribed (dev mode)" });
    }

    const supabase = getSupabaseClient();

    // Upsert so duplicate emails don't error
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert({ email, subscribed_at: new Date().toISOString() }, { onConflict: "email" });

    if (error) throw error;

    return NextResponse.json({ ok: true, message: "Subscribed!" });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
