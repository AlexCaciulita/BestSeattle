import fs from "node:fs";
import path from "node:path";

export type EventItem = {
  title: string;
  source: string;
  category: string;
  collected_at: string;
  zone?: string;
  sponsored?: boolean;
  timeframe?: "tonight" | "weekend" | "week";
  est_price?: number;
  starts_at?: string;
  thumbnail_url?: string;
};

export type RestaurantItem = {
  name: string;
  editorial_source: string;
  editorial_score_raw: number;
  zone_hint: string;
  cuisine: string;
  sponsored?: boolean;
};

function readJsonFile<T>(fileName: string, fallback: T): T {
  try {
    const filePath = path.resolve(process.cwd(), "..", "data", fileName);
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getSeedEvents(): EventItem[] {
  const rows = readJsonFile<EventItem[]>("seed_events.json", []);
  return rows.map((row, idx) => ({
    ...row,
    zone: row.zone ?? "Seattle Core",
    timeframe: row.timeframe ?? "week",
    est_price: typeof row.est_price === "number" ? row.est_price : 30,
    sponsored: row.sponsored ?? idx === 1,
  }));
}

export function getSeedRestaurants(): RestaurantItem[] {
  const rows = readJsonFile<RestaurantItem[]>("seed_restaurants.json", []);
  return rows.map((row, idx) => ({
    ...row,
    sponsored: idx === 2,
  }));
}

export function getCurationQueue() {
  const events = getSeedEvents().slice(0, 6).map((event, idx) => ({
    type: "event" as const,
    title: event.title,
    source: event.source,
    status: idx < 3 ? "pending" : "approved",
  }));

  const restaurants = getSeedRestaurants().slice(0, 6).map((restaurant, idx) => ({
    type: "restaurant" as const,
    title: restaurant.name,
    source: restaurant.editorial_source,
    status: idx < 4 ? "pending" : "approved",
  }));

  return [...events, ...restaurants];
}
