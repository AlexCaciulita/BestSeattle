import { NextRequest, NextResponse } from "next/server";
import { fetchAllSeattleAreaEvents } from "@/lib/ticketmaster";
import { fetchAllSerpApiEvents } from "@/lib/serpapi";
import { hasSupabaseConfig, getSupabaseClient } from "@/lib/supabase";
import type { Item } from "@/lib/items-repo";

/**
 * GET /api/cron/sync-events
 *
 * Automated sync endpoint designed for cron/scheduled invocation.
 * Protected by CRON_SECRET header check (Vercel Cron sends this automatically).
 *
 * Schedule strategy for SerpApi (250 queries per month, 6 queries per sync):
 *   - Every 4 days = about 7-8 syncs per month x 6 queries = 45 queries
 *   - Leaves about 200 queries buffer for manual previews or retries
 *
 * Vercel cron schedule: every 4 days at 6 AM UTC (10 PM PST)
 * Ticketmaster syncs can run daily since they have generous limits.
 */
export async function GET(req: NextRequest) {
  // Auth check: verify CRON_SECRET
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasSupabaseConfig()) {
    return NextResponse.json({
      ok: false,
      error: "Supabase not configured",
    }, { status: 500 });
  }

  const startTime = Date.now();
  const allEvents: Item[] = [];
  const errors: string[] = [];

  // --- Fetch from all sources ---

  // Ticketmaster (always)
  try {
    const tmEvents = await fetchAllSeattleAreaEvents(50);
    allEvents.push(...tmEvents);
    console.log(`[cron] Ticketmaster: ${tmEvents.length} events`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    errors.push(`Ticketmaster: ${msg}`);
    console.error("[cron] Ticketmaster failed:", err);
  }

  // SerpApi / Google Events (if key is set)
  if (process.env.SERPAPI_KEY) {
    try {
      const serpEvents = await fetchAllSerpApiEvents();
      allEvents.push(...serpEvents);
      console.log(`[cron] SerpApi: ${serpEvents.length} events`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      errors.push(`SerpApi: ${msg}`);
      console.error("[cron] SerpApi failed:", err);
    }
  }

  // --- Write to Supabase ---

  const supabase = getSupabaseClient();
  let inserted = 0;
  let skipped = 0;
  const catCounts = new Map<string, number>();

  for (const event of allEvents) {
    if (!event.category_slug) continue;

    // Dedup by source_event_id
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

    // Also cross-source dedup by title
    if (!isDuplicate) {
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
      console.error(`[cron] Insert failed "${event.title}":`, error.message);
    } else {
      inserted++;
      const slug = event.category_slug;
      catCounts.set(slug, (catCounts.get(slug) ?? 0) + 1);
    }
  }

  const duration = Date.now() - startTime;

  return NextResponse.json({
    ok: true,
    message: `Synced ${inserted} new events, skipped ${skipped} duplicates`,
    inserted,
    skipped,
    total_fetched: allEvents.length,
    categories: Object.fromEntries(catCounts),
    sources: {
      ticketmaster: allEvents.filter((e) => e.source === "Ticketmaster").length,
      google_events: allEvents.filter((e) => e.source === "Google Events").length,
    },
    duration_ms: duration,
    errors: errors.length > 0 ? errors : undefined,
  });
}
