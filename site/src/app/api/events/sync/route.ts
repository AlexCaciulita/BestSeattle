import { NextResponse } from "next/server";
import { fetchAllSeattleAreaEvents } from "@/lib/ticketmaster";
import { hasSupabaseConfig, getSupabaseClient } from "@/lib/supabase";

/**
 * POST /api/events/sync
 * Fetch events from Ticketmaster and upsert into Supabase items_curated table.
 * All events are assigned a canonical category_slug via the normalization pipeline.
 */
export async function POST() {
  try {
    const events = await fetchAllSeattleAreaEvents(50);

    if (!hasSupabaseConfig()) {
      return NextResponse.json({
        ok: true,
        message: "Fetched events (Supabase not configured — preview only)",
        count: events.length,
        events: events.slice(0, 5),
      });
    }

    const supabase = getSupabaseClient();

    let inserted = 0;
    let skipped = 0;

    // Category distribution for logging
    const catCounts = new Map<string, number>();

    for (const event of events) {
      // Guard: reject writes without category_slug
      if (!event.category_slug) {
        console.warn(`Skipping event without category_slug: "${event.title}"`);
        continue;
      }

      // Upsert by source_event_id if available, else dedup by title
      if (event.source_event_id) {
        const { data: existing } = await supabase
          .from("items_curated")
          .select("id")
          .eq("source", "Ticketmaster")
          .eq("source_event_id", event.source_event_id)
          .limit(1);

        if (existing && existing.length > 0) {
          skipped++;
          continue;
        }
      } else {
        const { data: existing } = await supabase
          .from("items_curated")
          .select("id")
          .eq("title", event.title)
          .eq("source", "Ticketmaster")
          .limit(1);

        if (existing && existing.length > 0) {
          skipped++;
          continue;
        }
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
      total_fetched: events.length,
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
 * Preview what Ticketmaster returns without writing to DB.
 */
export async function GET() {
  try {
    const events = await fetchAllSeattleAreaEvents(30);
    return NextResponse.json({
      ok: true,
      count: events.length,
      events,
    });
  } catch (err) {
    console.error("Event fetch failed:", err);
    return NextResponse.json(
      { ok: false, error: "Event fetch failed" },
      { status: 500 },
    );
  }
}
