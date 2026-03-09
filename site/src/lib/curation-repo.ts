import { getCurationQueue, getSeedEvents, getSeedRestaurants } from "@/lib/data";
import { getSupabaseClient, hasSupabaseConfig } from "@/lib/supabase";

export type CurationStatus = "pending" | "approved" | "published" | "rejected";

export type CurationItem = {
  id: number;
  item_type: "event" | "restaurant" | "place";
  title: string;
  source: string | null;
  zone: string | null;
  category: string | null;
  score: number | null;
  sponsored: boolean;
  status: CurationStatus;
  created_at?: string;
  updated_at?: string;
};

export async function listCurationItems(): Promise<CurationItem[]> {
  if (hasSupabaseConfig()) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("items_curated")
      .select("id,item_type,title,source,zone,category,score,sponsored,status,created_at,updated_at")
      .order("id", { ascending: false })
      .limit(200);

    if (error) throw error;
    return (data ?? []) as CurationItem[];
  }

  // local fallback for development before db is wired
  const queue = getCurationQueue();
  return queue.map((item, idx) => ({
    id: idx + 1,
    item_type: item.type,
    title: item.title,
    source: item.source,
    zone: null,
    category: null,
    score: null,
    sponsored: false,
    status: item.status as CurationStatus,
  }));
}

export async function seedFromJsonIfEmpty() {
  if (!hasSupabaseConfig()) return { inserted: 0, skipped: true };

  const supabase = getSupabaseClient();

  const { count, error: countError } = await supabase
    .from("items_curated")
    .select("id", { count: "exact", head: true });

  if (countError) throw countError;
  if ((count ?? 0) > 0) return { inserted: 0, skipped: true };

  const events = getSeedEvents().map((event) => ({
    item_type: "event",
    title: event.title,
    source: event.source,
    zone: event.zone ?? null,
    category: "events",
    score: null,
    sponsored: Boolean(event.sponsored),
    status: "pending",
  }));

  const restaurants = getSeedRestaurants().map((place) => ({
    item_type: "restaurant",
    title: place.name,
    source: place.editorial_source,
    zone: place.zone_hint,
    category: place.cuisine,
    score: Number(place.editorial_score_raw),
    sponsored: Boolean(place.sponsored),
    status: "pending",
  }));

  const payload = [...events, ...restaurants];
  const { error: insertError } = await supabase.from("items_curated").insert(payload);
  if (insertError) throw insertError;

  return { inserted: payload.length, skipped: false };
}

export async function createCurationItem(input: {
  item_type: CurationItem["item_type"];
  title: string;
  source?: string | null;
  zone?: string | null;
  category?: string | null;
  score?: number | null;
  sponsored?: boolean;
  status?: CurationStatus;
}) {
  if (!hasSupabaseConfig()) {
    return {
      id: Date.now(),
      ...input,
      source: input.source ?? null,
      zone: input.zone ?? null,
      category: input.category ?? null,
      score: input.score ?? null,
      sponsored: Boolean(input.sponsored),
      status: input.status ?? "pending",
    };
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("items_curated")
    .insert({
      ...input,
      source: input.source ?? null,
      zone: input.zone ?? null,
      category: input.category ?? null,
      score: input.score ?? null,
      sponsored: Boolean(input.sponsored),
      status: input.status ?? "pending",
    })
    .select("id,item_type,title,source,zone,category,score,sponsored,status")
    .single();

  if (error) throw error;
  return data as CurationItem;
}

export async function updateCurationStatus(id: number, status: CurationStatus) {
  if (!hasSupabaseConfig()) return { id, status, local: true };

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("items_curated")
    .update({ status })
    .eq("id", id)
    .select("id,item_type,title,source,zone,category,score,sponsored,status")
    .single();

  if (error) throw error;
  return data as CurationItem;
}
