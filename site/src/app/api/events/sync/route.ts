import { NextRequest, NextResponse } from "next/server";
import { fetchAllSeattleAreaEvents } from "@/lib/ticketmaster";
import { fetchAllSerpApiEvents } from "@/lib/serpapi";
import { hasSupabaseConfig, getSupabaseClient } from "@/lib/supabase";
import type { Item } from "@/lib/items-repo";

/**
 * POST /api/events/sync
 * Fetch events from all configured sources and upsert into Supabase.
 *
 * Query params:
 *   ?source=ticketmaster  — only Ticketmaster
 *   ?source=serpapi        — only SerpApi/Google Events
 *   (default)              — all sources
 */
export async function POST(req: NextRequest) {
  try {
    const source = req.nextUrl.searchParams.get("source");

    const allEvents: Item[] = [];

    // Ticketmaster
    if (!source || source === "ticketmaster") {
      try {
        const tmEvents = await fetchAllSeattleAreaEvents(50);
        allEvents.push(...tmEvents);
        console.log(`[sync] Ticketmaster: ${tmEvents.length} events`);
      } catch (err) {
        console.error("[sync] Ticketmaster fetch failed:", err);
      }
    }

    // SerpApi / Google Events
    if (!source || source === "serpapi") {
      if (process.env.SERPAPI_KEY) {
        try {
          const serpEvents = await fetchAllSerpApiEvents();
          allEvents.push(...serpEvents);
          console.log(`[sync] SerpApi: ${serpEvents.length} events`);
        } catch (err) {
          console.error("[sync] SerpApi fetch failed:", err);
        }
      } else {
        console.log("[sync] SERPAPI_KEY not set, skipping Google Events");
      }
    }

    if (!hasSupabaseConfig()) {
      return NextResponse.json({
        ok: true,
        message: "Fetched events (Supabase not configured — preview only)",
        count: allEvents.length,
        events: allEvents.slice(0, 10),
      });
    }

    const supabase = getSupabaseClient();

    let inserted = 0;
    let skipped = 0;
    const catCounts = new Map<string, number>();

    for (const event of allEvents) {
      if (!event.category_slug) {
        console.warn(`Skipping event without category_slug: "${event.title}"`);
        continue;
      }

      // Dedup: check by source_event_id first, then by title + source
      let isDuplicate = false;

      if (event.source_event_id) {
        const { data: existing } = await supabase
          .from("items_curated")
          .select("id")
          .eq("source", event.source)
          .eq("source_event_id", event.source_event_id)
          .limit(1);

        isDuplicate = (existing?.length ?? 0) > 0;
      }

      if (!isDuplicate) {
        // Also check by title to avoid cross-source duplicates
        const { data: existing } = await supabase
          .from("items_curated")
          .select("id")
          .eq("title", event.title)
          .limit(1);

        isDuplicate = (existing?.length ?? 0) > 0;
      }

      if (isDuplicate) {
        skipped++;
        continue;
      }

      const { error } = await supabase.from("items_curated").insert({
        item_type: event.item_type,
        title: event.title,
        source: event.source,
        source_event_id: event.source_event_id ?? null,
        description: event.description ?? null,
        venue_name: event.venue_name ?? null,
        lat: event.lat ?? null,
        lng: event.lng ?? null,
        price_min: event.price_min ?? null,
        price_max: event.price_max ?? null,
        confidence: event.confidence ?? null,
        zone: event.zone,
        category: event.category,
        category_slug: event.category_slug,
        subcategory_slug: event.subcategory_slug ?? null,
        source_category_raw: event.source_category_raw ?? null,
        score: null,
        sponsored: false,
        status: "approved",
        metadata: {
          est_price: event.metadata?.est_price,
          booking_url: event.metadata?.booking_url,
          thumbnail_url: event.metadata?.thumbnail_url,
          city: event.metadata?.city,
          timeframe: event.metadata?.timeframe,
          starts_at: event.metadata?.starts_at,
          content_type: event.metadata?.content_type,
        },
      });

      if (error) {
        console.error(`Failed to insert "${event.title}":`, error.message);
      } else {
        inserted++;
        const slug = event.category_slug;
        catCounts.set(slug, (catCounts.get(slug) ?? 0) + 1);
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Synced ${inserted} new events, skipped ${skipped} duplicates`,
      inserted,
      skipped,
      total_fetched: allEvents.length,
      categories: Object.fromEntries(catCounts),
    });
  } catch (err) {
    console.error("Event sync failed:", err);
    return NextResponse.json(
      { ok: false, error: "Event sync failed" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/events/sync
 * Preview events from all sources without writing to DB.
 *
 * Query params:
 *   ?source=ticketmaster
 *   ?source=serpapi
 */
export async function GET(req: NextRequest) {
  try {
    const source = req.nextUrl.searchParams.get("source");
    const allEvents: Item[] = [];

    if (!source || source === "ticketmaster") {
      try {
        const tmEvents = await fetchAllSeattleAreaEvents(30);
        allEvents.push(...tmEvents);
      } catch (err) {
        console.error("[sync preview] Ticketmaster failed:", err);
      }
    }

    if (!source || source === "serpapi") {
      if (process.env.SERPAPI_KEY) {
        try {
          const serpEvents = await fetchAllSerpApiEvents();
          allEvents.push(...serpEvents);
        } catch (err) {
          console.error("[sync preview] SerpApi failed:", err);
        }
      }
    }

    return NextResponse.json({
      ok: true,
      count: allEvents.length,
      sources: {
        ticketmaster: allEvents.filter((e) => e.source === "Ticketmaster").length,
        google_events: allEvents.filter((e) => e.source === "Google Events").length,
      },
      events: allEvents,
    });
  } catch (err) {
    console.error("Event fetch failed:", err);
    return NextResponse.json(
      { ok: false, error: "Event fetch failed" },
      { status: 500 },
    );
  }
}
