"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { EventItem } from "@/lib/data";

type ViewMode = "tonight" | "weekend" | "under25";

type Props = {
  events: EventItem[];
};

function normalize(events: EventItem[]) {
  return events.map((event) => {
    const collected = event.collected_at ? new Date(event.collected_at).getTime() : Date.now();
    const ageHours = Math.max(0, (Date.now() - collected) / (1000 * 60 * 60));

    const freshness = ageHours < 12 ? "fresh" : ageHours < 48 ? "recent" : "stale";

    const sourceScore: Record<string, number> = {
      "Seattle Met": 90,
      "Visit Seattle": 85,
      Do206: 80,
      EverOut: 82,
    };

    const confidence = sourceScore[event.source] ?? 72;

    const sourceBookingMap: Record<string, string> = {
      "Visit Seattle": "https://visitseattle.org/things-to-do/events/",
      "Seattle Met": "https://www.seattlemet.com/arts-and-culture/things-to-do-in-seattle-events",
      Do206: "https://do206.com/events/today",
      EverOut: "https://everout.com/seattle/",
    };

    return {
      ...event,
      timeframe: event.timeframe ?? "week",
      estPrice: event.est_price ?? 30,
      freshness,
      confidence,
      bookingUrl: sourceBookingMap[event.source],
    };
  });
}

export default function EventsFeed({ events }: Props) {
  const [mode, setMode] = useState<ViewMode>("tonight");
  const rows = useMemo(() => normalize(events), [events]);

  const filtered = rows.filter((event) => {
    if (mode === "tonight") return event.timeframe === "tonight";
    if (mode === "weekend") return event.timeframe === "weekend";
    if (mode === "under25") return event.estPrice <= 25;
    return true;
  });

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2">
        {[
          { key: "tonight", label: "Tonight" },
          { key: "weekend", label: "This Weekend" },
          { key: "under25", label: "Under $25" },
        ].map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => setMode(filter.key as ViewMode)}
            className={`rounded-full border px-3 py-1 text-sm ${
              mode === filter.key
                ? "border-accent bg-accent/10 text-foreground"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {filtered.map((event) => (
          <article key={`${event.title}-${event.collected_at}`} className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="grid md:grid-cols-[220px_1fr]">
              <div className="relative h-36 w-full bg-background md:h-full">
                <Image
                  src={event.thumbnail_url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80"}
                  alt={event.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 220px"
                  unoptimized
                />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-medium">{event.title}</p>
                  {event.sponsored ? (
                    <span className="rounded-full border border-accent px-2 py-0.5 text-xs text-accent">Sponsored</span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-muted">
                  {event.source} · {event.zone} · est. ${event.estPrice}
                  {event.starts_at ? ` · ${new Date(event.starts_at).toLocaleDateString()}` : ""}
                </p>
                <div className="mt-2 flex gap-2">
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
                    Freshness: {event.freshness}
                  </span>
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
                    Confidence: {event.confidence}
                  </span>
                </div>
                <div className="mt-3">
                  <a
                    href={event.bookingUrl || "#"}
                    target={event.bookingUrl ? "_blank" : undefined}
                    rel={event.bookingUrl ? "noreferrer" : undefined}
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      event.bookingUrl
                        ? "border border-accent text-accent hover:bg-accent/10"
                        : "border border-border text-muted"
                    }`}
                  >
                    {event.bookingUrl ? "Book / View event" : "Details coming soon"}
                  </a>
                </div>
              </div>
            </div>
          </article>
        ))}
        {filtered.length === 0 ? (
          <p className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
            No picks in this filter yet. More sources are being ingested.
          </p>
        ) : null}
      </div>
    </>
  );
}
