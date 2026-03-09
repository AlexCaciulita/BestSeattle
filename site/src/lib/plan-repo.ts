import { getSeedEvents, getSeedRestaurants } from "@/lib/data";
import { getSupabaseClient, hasSupabaseConfig } from "@/lib/supabase";

export type PlanItem = {
  kind: "event" | "restaurant";
  title: string;
  zone: string;
  category: string;
  estPrice: number;
  source: string;
  score?: number;
  thumbnailUrl?: string;
  bookingUrl?: string;
  bookingProvider?: string;
};

function normalizeZone(z?: string | null) {
  if (!z) return "Seattle Core";
  return z;
}

function fallbackThumb(kind: "event" | "restaurant", category: string) {
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

function localFallback(slug: string): PlanItem[] {
  const events = getSeedEvents().map((e) => ({
    kind: "event" as const,
    title: e.title,
    zone: normalizeZone(e.zone),
    category: e.category,
    estPrice: e.est_price ?? 30,
    source: e.source,
    score: undefined,
    thumbnailUrl: e.thumbnail_url ?? fallbackThumb("event", e.category),
    bookingUrl: "https://visitseattle.org/things-to-do/events/",
    bookingProvider: "Visit Seattle",
  }));

  const restaurants = getSeedRestaurants().map((r) => ({
    kind: "restaurant" as const,
    title: r.name,
    zone: normalizeZone(r.zone_hint),
    category: r.cuisine,
    estPrice: 40,
    source: r.editorial_source,
    score: r.editorial_score_raw,
    thumbnailUrl: fallbackThumb("restaurant", r.cuisine),
    bookingUrl: "https://www.theinfatuation.com/seattle/guides/best-restaurants-seattle",
    bookingProvider: "The Infatuation",
  }));

  const merged = [...events, ...restaurants];

  if (slug === "family-day") {
    return merged.filter((x) =>
      ["Food & Drink", "Visual Arts", "Family", "Diner", "Cafe", "Italian", "Mexican"].some((k) =>
        x.category.toLowerCase().includes(k.toLowerCase()),
      ),
    );
  }

  if (slug === "rainy-day") {
    return merged.filter((x) =>
      ["Visual Arts", "Theater", "Coffee", "Japanese", "Italian", "Nightlife"].some((k) =>
        x.category.toLowerCase().includes(k.toLowerCase()),
      ),
    );
  }

  // date-night default
  return merged.filter((x) => x.estPrice <= 120);
}

export async function getPlanItems(slug: string): Promise<PlanItem[]> {
  if (!hasSupabaseConfig()) return localFallback(slug).slice(0, 20);

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("items_curated")
    .select("item_type,title,source,zone,category,score,metadata,status")
    .in("status", ["approved", "published"])
    .in("item_type", ["event", "restaurant"])
    .limit(300);

  if (error) throw error;

  type Row = {
    item_type: "event" | "restaurant";
    title: string;
    source: string | null;
    zone: string | null;
    category: string | null;
    score: number | null;
    metadata: { est_price?: number; thumbnail_url?: string; booking_url?: string } | null;
  };

  const mapped: PlanItem[] = ((data ?? []) as Row[]).map((row) => ({
    kind: row.item_type,
    title: row.title,
    zone: normalizeZone(row.zone),
    category: row.category ?? "General",
    estPrice: Number(row?.metadata?.est_price ?? 40),
    source: row.source ?? "BestInSeattle",
    score: row.score ?? undefined,
    thumbnailUrl: row?.metadata?.thumbnail_url ?? fallbackThumb(row.item_type, row.category ?? "General"),
    bookingUrl: row?.metadata?.booking_url,
    bookingProvider: row.source ?? "BestInSeattle",
  }));

  if (mapped.length === 0) return localFallback(slug).slice(0, 20);

  return mapped;
}
