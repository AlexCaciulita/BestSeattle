import { getSeedEvents, getSeedRestaurants } from "@/lib/data";
import { getSupabaseClient, hasSupabaseConfig } from "@/lib/supabase";
import {
  classifyTimeWindow,
  sortByStartTime,
  formatRelativeTime,
  type TimeWindow,
} from "@/lib/time-utils";
import { CATEGORY_BY_SLUG, DEFAULT_FALLBACK_IMAGE } from "@/lib/event-categories";
import { pickFeatured } from "@/lib/ranking";

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
  /** True when the image came from source data (not an Unsplash fallback) */
  hasOriginalImage: boolean;
  /** Sponsored / promoted item */
  sponsored: boolean;
};

/** Detect low-quality thumbnails that should be replaced with fallbacks */
function isLowQualityImage(url: string): boolean {
  const lower = url.toLowerCase();
  // Very small images from any source
  if (lower.includes("w=") && /w=(\d+)/.test(lower)) {
    const w = parseInt(lower.match(/w=(\d+)/)?.[1] ?? "0");
    if (w > 0 && w < 400) return true;
  }
  // Ticketmaster CDN: reject only small/logo-sized images, keep large promotional ones
  if (lower.includes("ticketm.net") || lower.includes("tmconst.com")) {
    // Images with explicit small dimensions in the URL path (e.g., /dam/a/.../100x100.jpg)
    const dimMatch = lower.match(/\/(\d+)x(\d+)\./);
    if (dimMatch) {
      const w = parseInt(dimMatch[1]);
      const h = parseInt(dimMatch[2]);
      if (w < 400 || h < 300) return true;
    }
    // If no dimensions in URL, assume it's a usable promotional image
    return false;
  }
  return false;
}

function fallbackThumb(kind: TonightItem["kind"], category: string, categorySlug?: string): string {
  if (kind === "restaurant") {
    return CATEGORY_BY_SLUG.get("food-drink")?.fallbackImage ?? DEFAULT_FALLBACK_IMAGE;
  }
  // Try category slug first for exact match
  if (categorySlug) {
    const cat = CATEGORY_BY_SLUG.get(categorySlug);
    if (cat) return cat.fallbackImage;
  }
  // Try matching category label to slug
  const lower = category.toLowerCase();
  for (const [slug, cat] of CATEGORY_BY_SLUG) {
    if (lower.includes(slug) || lower.includes(cat.label.toLowerCase())) {
      return cat.fallbackImage;
    }
  }
  return DEFAULT_FALLBACK_IMAGE;
}

/** Resolve image URL: use provided URL if high quality, otherwise use category fallback */
function resolveImageUrl(
  thumbnailUrl: string | undefined,
  kind: TonightItem["kind"],
  category: string,
  categorySlug?: string,
): string {
  if (!thumbnailUrl) return fallbackThumb(kind, category, categorySlug);
  if (isLowQualityImage(thumbnailUrl)) return fallbackThumb(kind, category, categorySlug);
  return thumbnailUrl;
}

function localFallback(): TonightItem[] {
  const events: TonightItem[] = getSeedEvents()
    .filter((e) => e.timeframe === "tonight" || e.timeframe === "weekend")
    .slice(0, 10)
    .map((e, idx) => ({
      id: `e-${idx}`,
      kind: "event" as const,
      title: e.title,
      category: e.category,
      zone: e.zone ?? "Seattle",
      estPrice: e.est_price ?? 35,
      source: e.source,
      bookingUrl: "https://visitseattle.org/things-to-do/events/",
      thumbnailUrl: resolveImageUrl(e.thumbnail_url, "event", e.category),
      startsAt: e.starts_at,
      hasOriginalImage: false,
      sponsored: false,
    }));

  const restaurants: TonightItem[] = getSeedRestaurants()
    .slice(0, 8)
    .map((r, idx) => ({
      id: `r-${idx}`,
      kind: "restaurant" as const,
      title: r.name,
      category: r.cuisine,
      zone: r.zone_hint,
      estPrice: 40,
      source: r.editorial_source,
      bookingUrl: "https://www.theinfatuation.com/seattle/guides/best-restaurants-seattle",
      thumbnailUrl: resolveImageUrl(undefined, "restaurant", r.cuisine),
      hasOriginalImage: false,
      sponsored: false,
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
  sponsored: boolean | null;
  metadata: {
    est_price?: number;
    booking_url?: string;
    thumbnail_url?: string;
    starts_at?: string;
  } | null;
};

function rowToItem(r: Row): TonightItem {
  const startsAt = r.metadata?.starts_at;
  const rawThumb = r.metadata?.thumbnail_url;
  const hasOriginalImage = !!rawThumb && !isLowQualityImage(rawThumb);
  return {
    id: String(r.id),
    kind: r.item_type,
    title: r.title,
    category: r.category ?? "General",
    categorySlug: r.category_slug ?? undefined,
    zone: (r.zone === "Seattle Core" ? "Seattle" : r.zone) ?? "Seattle",
    venueName: r.venue_name ?? undefined,
    estPrice: Number(r.metadata?.est_price ?? 40),
    source: r.source ?? "BestInSeattle",
    bookingUrl: r.metadata?.booking_url,
    thumbnailUrl: resolveImageUrl(rawThumb, r.item_type, r.category ?? "General", r.category_slug ?? undefined),
    startsAt,
    relativeTime: formatRelativeTime(startsAt),
    timeWindow: classifyTimeWindow(startsAt),
    hasOriginalImage,
    sponsored: r.sponsored ?? false,
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
  /** Top picks for the hero carousel (diverse categories, ranked by quality) */
  heroCarousel: TonightItem[];
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
      .select("id,item_type,title,source,zone,category,category_slug,venue_name,metadata,status,sponsored")
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

  // Hero carousel: top 5 diverse picks from tonight's events, ranked by quality score
  const tonightPool = [...happeningNow, ...startingSoon, ...laterTonight];
  const heroCarousel = pickFeatured(tonightPool.length > 0 ? tonightPool : sorted, 5);

  return {
    happeningNow,
    startingSoon,
    laterTonight,
    tomorrow,
    weekend,
    thisWeek,
    restaurants: restaurants.slice(0, 8),
    heroPick,
    heroCarousel,
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
