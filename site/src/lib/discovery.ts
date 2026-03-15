import type { TonightItem } from "@/lib/tonight-repo";

export type DiscoveryIntent = {
  vibe: "date-night" | "family" | "adventure" | "chill";
  zone: string;
  budget: number;
  query: string;
};

export function parseIntent(query: string): DiscoveryIntent {
  const q = query.toLowerCase();

  let vibe: DiscoveryIntent["vibe"] = "date-night";
  if (q.includes("family") || q.includes("kids") || q.includes("child")) vibe = "family";
  else if (q.includes("adventure") || q.includes("hike") || q.includes("outdoor")) vibe = "adventure";
  else if (q.includes("chill") || q.includes("quiet") || q.includes("coffee")) vibe = "chill";

  const budgetMatch = q.match(/\$?\s?(\d{2,3})/);
  let budget = budgetMatch ? Number(budgetMatch[1]) : 80;
  if (q.includes("cheap") || q.includes("budget")) budget = Math.min(budget, 40);
  if (q.includes("luxury") || q.includes("fancy")) budget = Math.max(budget, 120);

  const knownZones = [
    "capitol hill",
    "ballard",
    "fremont",
    "queen anne",
    "west seattle",
    "bellevue",
    "redmond",
    "kirkland",
    "seattle",
    "eastside",
  ];
  const zone = knownZones.find((z) => q.includes(z)) ?? "All";

  return { vibe, zone, budget, query };
}

export function scoreItem(item: TonightItem, intent: DiscoveryIntent) {
  let score = 0;

  if (intent.zone === "All" || item.zone.toLowerCase().includes(intent.zone.toLowerCase())) score += 25;
  if (item.estPrice <= intent.budget) score += 25;

  const cat = item.category.toLowerCase();
  if (intent.vibe === "date-night") {
    if (item.kind === "restaurant") score += 25;
    if (cat.includes("music") || cat.includes("theater") || cat.includes("play")) score += 15;
  }
  if (intent.vibe === "family") {
    if (cat.includes("family")) score += 30;
    if (item.estPrice <= 35) score += 15;
  }
  if (intent.vibe === "adventure") {
    if (cat.includes("play") || cat.includes("live") || cat.includes("sports")) score += 20;
    if (item.kind !== "restaurant") score += 10;
  }
  if (intent.vibe === "chill") {
    if (item.kind === "restaurant") score += 15;
    if (cat.includes("art") || cat.includes("visual") || cat.includes("coffee")) score += 20;
  }

  if (item.bookingUrl) score += 10;

  if (intent.query) {
    const q = intent.query.toLowerCase();
    if (item.title.toLowerCase().includes(q)) score += 10;
    if (cat.includes(q)) score += 8;
  }

  return score;
}
