"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { PlanItem } from "@/lib/plan-repo";

type Props = {
  slug: string;
  items: PlanItem[];
};

const ZONES = ["All", "Seattle", "Eastside/PNW", "Capitol Hill", "Ballard", "Bellevue"];
const BUDGETS = [
  { label: "All budgets", value: 9999 },
  { label: "Under $25", value: 25 },
  { label: "Under $50", value: 50 },
  { label: "Under $100", value: 100 },
];

export default function PlanDetailClient({ slug, items }: Props) {
  const [zone, setZone] = useState("All");
  const [budget, setBudget] = useState(50);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const zoneOk = zone === "All" || item.zone.includes(zone) || zone.includes(item.zone);
      const budgetOk = item.estPrice <= budget;
      return zoneOk && budgetOk;
    });
  }, [items, zone, budget]);

  const title = slug.replaceAll("-", " ");

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-4xl font-semibold capitalize">{title} plan</h1>
      <p className="mt-3 text-muted">Auto-generated from approved items, filtered by zone and budget.</p>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <label className="rounded-lg border border-border bg-surface p-3 text-sm">
          Zone
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="mt-2 w-full rounded-md border border-border bg-background px-2 py-2"
          >
            {ZONES.map((z) => (
              <option key={z}>{z}</option>
            ))}
          </select>
        </label>

        <label className="rounded-lg border border-border bg-surface p-3 text-sm">
          Budget
          <select
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="mt-2 w-full rounded-md border border-border bg-background px-2 py-2"
          >
            {BUDGETS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-8 space-y-3">
        {filtered.map((item) => (
          <article key={`${item.kind}-${item.title}`} className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="grid md:grid-cols-[180px_1fr]">
              <div className="relative h-28 bg-background md:h-full">
                <Image src={item.thumbnailUrl || ""} alt={item.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 180px" unoptimized />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{item.title}</p>
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted capitalize">
                    {item.kind}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {item.category} · {item.zone} · ~${item.estPrice} · {item.source}
                </p>
                <div className="mt-3">
                  <a
                    href={item.bookingUrl || "#"}
                    target={item.bookingUrl ? "_blank" : undefined}
                    rel={item.bookingUrl ? "noreferrer" : undefined}
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      item.bookingUrl
                        ? "border border-accent text-accent hover:bg-accent/10"
                        : "border border-border text-muted"
                    }`}
                  >
                    {item.bookingUrl ? `Book via ${item.bookingProvider || "Provider"}` : "Details coming soon"}
                  </a>
                </div>
              </div>
            </div>
          </article>
        ))}

        {filtered.length === 0 ? (
          <p className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
            No items match this zone/budget yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}
