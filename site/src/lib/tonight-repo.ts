import { getSeedEvents, getSeedRestaurants } from "@/lib/data";
import { getSupabaseClient, hasSupabaseConfig } from "@/lib/supabase";
import {
  classifyTimeWindow,
  sortByStartTime,
  formatRelativeTime,
  type TimeWindow,
} from "@/lib/time-utils";

export type TonightItem = {
  id: string;
  kind: "event" | "restaurant" | "place";
  title: string;
  category: string;
  categorySlug?: string;
  zone: string;
  venueName?: string;
  estPrice: number;
  source: string;
  bookingUrl?: string;
  thumbnailUrl?: string;
  startsAt?: string;
  relativeTime?: string;
  timeWindow?: TimeWindow;
};

function fallbackThumb(kind: TonightItem["kind"], category: string) {
  if (kind === "restaurant") {
    return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80";
  }
  if (category.toLowerCase().includes("family")) {
    return "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80";
  }
  if (category.toLowerCase().includes("play")) {
    return "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80";
  }
  return "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80";
}

function localFallback(): TonightItem[] {
  const events: TonightItem[] = getSeedEvents()
    .filter((e) => e.timeframe === "tonight" || e.timeframe === "weekend")
    .slice(0, 10)
    .map((e, idx) => ({
      id: `e-${idx}`,
      kind: "event",
      title: e.title,
      category: e.category,
      zone: e.zone ?? "Seattle Core",
      estPrice: e.est_price ?? 35,
      source: e.source,
      bookingUrl: "https://visitseattle.org/things-to-do/events/",
      thumbnailUrl: e.thumbnail_url ?? fallbackThumb("event", e.category),
      startsAt: e.starts_at,
    }));

  const restaurants: TonightItem[] = getSeedRestaurants()
    .slice(0, 8)
    .map((r, idx) => ({
      id: `r-${idx}`,
      kind: "restaurant",
      title: r.name,
      category: r.cuisine,
      zone: r.zone_hint,
      estPrice: 40,
      source: r.editorial_source,
      bookingUrl: "https://www.theinfatuation.com/seattle/guides/best-restaurants-seattle",
      thumbnailUrl: fallbackThumb("restaurant", r.cuisine),
    }));

  return [...events, ...restaurants];
}

type Row = {
  id: number;
  item_type: TonightItem["kind"];
  title: string;
  source: string | null;
  zone: string | null;
  category: string | null;
  category_slug: string | null;
  venue_name: string | null;
  metadata: {
    est_price?: number;
    booking_url?: string;
    thumbnail_url?: string;
    starts_at?: string;
  } | null;
};

function rowToItem(r: Row): TonightItem {
  const startsAt = r.metadata?.starts_at;
  return {
    id: String(r.id),
    kind: r.item_type,
    title: r.title,
    category: r.category ?? "General",
    categorySlug: r.category_slug ?? undefined,
    zone: r.zone ?? "Seattle Core",
    venueName: r.venue_name ?? undefined,
    estPrice: Number(r.metadata?.est_price ?? 40),
    source: r.source ?? "BestInSeattle",
    bookingUrl: r.metadata?.booking_url,
    thumbnailUrl: r.metadata?.thumbnail_url ?? fallbackThumb(r.item_type, r.category ?? "General"),
    startsAt,
    relativeTime: formatRelativeTime(startsAt),
    timeWindow: classifyTimeWindow(startsAt),
  };
}

export type TonightBoard = {
  /** Happening right now or starting very soon */
  happeningNow: TonightItem[];
  /** Starting within a few hours */
  startingSoon: TonightItem[];
  /** Later tonight / today */
  laterTonight: TonightItem[];
  /** Tomorrow picks */
  tomorrow: TonightItem[];
  /** This weekend picks */
  weekend: TonightItem[];
  /** This week picks */
  thisWeek: TonightItem[];
  /** Top restaurant picks (always shown) */
  restaurants: TonightItem[];
  /** Hero pick: the single best item to feature */
  heroPick: TonightItem | null;
  /** Total event count */
  totalEvents: number;
};

export async function getTonightBoard(): Promise<TonightBoard> {
  let allItems: TonightItem[];

  if (!hasSupabaseConfig()) {
    allItems = localFallback();
  } else {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("items_curated")
      .select("id,item_type,title,source,zone,category,category_slug,venue_name,metadata,status")
      .in("status", ["approved", "published"])
      .in("item_type", ["event", "restaurant", "place"])
      .order("id", { ascending: false })
      .limit(500);

    if (error) throw error;
    allItems = ((data ?? []) as Row[]).map(rowToItem);
  }

  // Enrich with time windows
  allItems = allItems.map((item) => ({
    ...item,
    relativeTime: formatRelativeTime(item.startsAt),
    timeWindow: classifyTimeWindow(item.startsAt),
  }));

  // Split events and restaurants
  const events = allItems.filter((x) => x.kind === "event");
  const restaurants = allItems.filter((x) => x.kind === "restaurant");

  // Sort events by start time
  const sorted = sortByStartTime(
    events.map((e) => ({ ...e, metadata: { starts_at: e.startsAt } })),
  ).map((e) => {
    const { metadata: _m, ...rest } = e;
    return rest as TonightItem;
  });

  // Group by time window
  const happeningNow = sorted.filter((e) => e.timeWindow === "now");
  const startingSoon = sorted.filter((e) => e.timeWindow === "soon");
  const laterTonight = sorted.filter((e) => e.timeWindow === "tonight");
  const tomorrow = sorted.filter((e) => e.timeWindow === "tomorrow");
  const weekend = sorted.filter((e) => e.timeWindow === "weekend");
  const thisWeek = sorted.filter((e) => e.timeWindow === "week");

  // Hero pick: first happening-now, then soon, then tonight
  const heroPick = happeningNow[0] ?? startingSoon[0] ?? laterTonight[0] ?? sorted[0] ?? null;

  return {
    happeningNow,
    startingSoon,
    laterTonight,
    tomorrow,
    weekend,
    thisWeek,
    restaurants: restaurants.slice(0, 8),
    heroPick,
    totalEvents: events.length,
  };
}

/**
 * Get events for a specific tab/time range.
 */
export async function getEventsForTab(
  tab: "tonight" | "weekend" | "week",
): Promise<TonightItem[]> {
  const board = await getTonightBoard();

  switch (tab) {
    case "tonight":
      return [...board.happeningNow, ...board.startingSoon, ...board.laterTonight];
    case "weekend":
      return [...board.happeningNow, ...board.startingSoon, ...board.laterTonight, ...board.tomorrow, ...board.weekend];
    case "week":
      return [
        ...board.happeningNow,
        ...board.startingSoon,
        ...board.laterTonight,
        ...board.tomorrow,
        ...board.weekend,
        ...board.thisWeek,
      ];
  }
}
