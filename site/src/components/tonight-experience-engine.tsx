"use client";

import { useMemo, useState } from "react";
import type { TonightItem } from "@/lib/tonight-repo";
import { scoreItem as discoveryScore } from "@/lib/discovery";

type Props = {
  items: TonightItem[];
};

type Vibe = "date-night" | "family" | "adventure" | "chill";

function uniqZones(items: TonightItem[]) {
  return ["All", ...Array.from(new Set(items.map((i) => i.zone))).sort()];
}

function scoreItem(item: TonightItem, vibe: Vibe, zone: string, budget: number) {
  // Use the canonical scoring from discovery.ts
  const intent = { vibe, zone, budget, query: "" };
  return discoveryScore(item, intent);
}

export default function TonightExperienceEngine({ items }: Props) {
  const [zone, setZone] = useState("All");
  const [budget, setBudget] = useState(80);
  const [vibe, setVibe] = useState<Vibe>("date-night");
  const [aiMode, setAiMode] = useState(true);
  const [query, setQuery] = useState("");
  const [aiPicks, setAiPicks] = useState<TonightItem[]>([]);
  const [aiSummary, setAiSummary] = useState<string>("");

  const zones = useMemo(() => uniqZones(items), [items]);

  async function runAiSearch() {
    if (!query.trim()) return;
    const res = await fetch("/api/discovery/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const payload = await res.json();
    if (!res.ok || !payload.ok) {
      setAiSummary("Could not parse query yet. Try another phrase.");
      setAiPicks([]);
      return;
    }

    const intent = payload.intent as { vibe: string; zone: string; budget: number };
    setAiSummary(`AI intent: ${intent.vibe} · ${intent.zone} · under $${intent.budget}`);
    setAiPicks((payload.picks ?? []) as TonightItem[]);
  }

  const itinerary = useMemo(() => {
    if (aiMode && aiPicks.length > 0) {
      return aiPicks.slice(0, 3);
    }

    const ranked = [...items]
      .map((item) => ({ item, score: scoreItem(item, vibe, zone, budget) }))
      .filter((x) => x.score > 20)
      .sort((a, b) => b.score - a.score);

    const dinner = ranked.find((x) => x.item.kind === "restaurant");
    const experience = ranked.find((x) => x.item.kind !== "restaurant");
    const backup = ranked.find((x) => x.item.id !== dinner?.item.id && x.item.id !== experience?.item.id);

    return [dinner?.item, experience?.item, backup?.item].filter(Boolean) as TonightItem[];
  }, [items, vibe, zone, budget, aiMode, aiPicks]);

  return (
    <section className="mt-10 rounded-2xl border border-border bg-surface p-6">
      <h2 className="text-2xl font-semibold">⚡ Build My Tonight Plan</h2>
      <p className="mt-2 text-sm text-muted">Pick your vibe, zone, and budget — or use AI with a short phrase.</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setAiMode(true)}
          className={`rounded-full border px-3 py-1 text-xs ${aiMode ? "border-accent text-accent" : "border-border text-muted"}`}
        >
          AI Mode
        </button>
        <button
          type="button"
          onClick={() => setAiMode(false)}
          className={`rounded-full border px-3 py-1 text-xs ${!aiMode ? "border-accent text-accent" : "border-border text-muted"}`}
        >
          Manual Mode
        </button>
      </div>

      {aiMode ? (
        <div className="mt-4 rounded-xl border border-border bg-background p-3">
          <label className="text-sm">Describe what you want (e.g. &quot;cheap date night cap hill&quot;)</label>
          <div className="mt-2 flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="family indoor bellevue under 60"
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
            />
            <button onClick={runAiSearch} className="rounded-full border border-accent px-3 py-1 text-xs font-semibold text-accent">
              Find Picks
            </button>
          </div>
          {aiSummary ? <p className="mt-2 text-xs text-muted">{aiSummary}</p> : null}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="text-sm">
          Vibe
          <select value={vibe} onChange={(e) => setVibe(e.target.value as Vibe)} className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2">
            <option value="date-night">Date Night</option>
            <option value="family">Family</option>
            <option value="adventure">Adventure</option>
            <option value="chill">Chill</option>
          </select>
        </label>

        <label className="text-sm">
          Zone
          <select value={zone} onChange={(e) => setZone(e.target.value)} className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2">
            {zones.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          Budget (${budget})
          <input type="range" min={20} max={200} step={5} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="mt-3 w-full" />
        </label>
      </div>

      <div className="mt-6 space-y-3">
        {itinerary.map((item, idx) => (
          <article key={item.id} className="rounded-xl border border-border bg-background p-4">
            <p className="text-xs text-muted">Stop {idx + 1}</p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <p className="font-medium">{item.title}</p>
              <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted capitalize">{item.kind}</span>
            </div>
            <p className="mt-1 text-sm text-muted">{item.category} · {item.zone} · ~${item.estPrice}</p>
            <div className="mt-2">
              <a href={item.bookingUrl || "#"} target={item.bookingUrl ? "_blank" : undefined} rel={item.bookingUrl ? "noreferrer" : undefined} className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${item.bookingUrl ? "border border-accent text-accent" : "border border-border text-muted"}`}>
                {item.bookingUrl ? "Open booking" : "No booking link"}
              </a>
            </div>
          </article>
        ))}
        {itinerary.length === 0 ? <p className="text-sm text-muted">No confident plan from this filter yet. Try a broader zone or higher budget.</p> : null}
      </div>
    </section>
  );
}
