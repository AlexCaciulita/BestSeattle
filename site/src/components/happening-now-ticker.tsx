"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type TickerItem = {
  id: string;
  title: string;
  category?: string;
  relativeTime?: string;
  startsAt?: string;
  venueName?: string;
  zone: string;
};

function CountdownTimer({ startsAt }: { startsAt: string }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    function update() {
      const now = new Date();
      const start = new Date(startsAt);
      const diffMs = start.getTime() - now.getTime();
      const diffMin = Math.round(diffMs / (1000 * 60));

      if (diffMin <= 0 && diffMin >= -240) {
        setLabel("LIVE");
      } else if (diffMin > 0 && diffMin <= 60) {
        setLabel(`${diffMin}m`);
      } else if (diffMin > 60 && diffMin <= 180) {
        const h = Math.floor(diffMin / 60);
        const m = diffMin % 60;
        setLabel(`${h}h${m > 0 ? ` ${m}m` : ""}`);
      } else {
        setLabel("");
      }
    }

    update();
    const interval = setInterval(update, 10_000);
    return () => clearInterval(interval);
  }, [startsAt]);

  if (!label) return null;

  const isLive = label === "LIVE";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        isLive
          ? "border border-[#163826] bg-[#0b1d14] text-[#32d74b]"
          : "border border-white/8 bg-white/[0.05] text-[#ffd60a]"
      }`}
    >
      {isLive && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
      )}
      {isLive ? "Live" : label}
    </span>
  );
}

export default function HappeningNowTicker({
  items,
}: {
  items: TickerItem[];
}) {
  if (items.length === 0) return null;

  // Triple for seamless infinite scroll
  const tripled = [...items, ...items, ...items];

  return (
    <div className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] left-3 right-3 z-30 overflow-hidden rounded-2xl border border-white/10 bg-[rgba(12,15,20,0.88)] shadow-[var(--panel-shadow)] backdrop-blur-xl md:bottom-4 md:left-4 md:right-4 md:rounded-full">
      <div className="absolute bottom-0 left-0 top-0 z-10 flex items-center bg-gradient-to-r from-[#0c0f14] via-[#0c0f14]/92 to-transparent pl-3 pr-6 md:pl-5 md:pr-10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
            Live
          </span>
          <span className="text-white/15">|</span>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-12 bg-gradient-to-l from-[#0c0f14] to-transparent" />

      <div className="ticker-scroll flex items-center gap-0 py-3 pl-20 md:pl-28">
        {tripled.map((item, i) => (
          <Link
            key={`${item.id}-${i}`}
            href={`/item/${item.id}`}
            className="group flex shrink-0 items-center border-r border-white/6 px-4 py-0.5 transition-colors hover:bg-white/[0.04]"
          >
            {item.startsAt && <CountdownTimer startsAt={item.startsAt} />}
            <span className="ml-2 max-w-[180px] truncate text-[12px] font-semibold text-white/75 transition-colors group-hover:text-white">
              {item.title}
            </span>
            <span className="ml-2 hidden text-[10px] text-white/35 sm:inline">
              {item.venueName ?? item.zone}
            </span>
            {item.category && (
              <span className="ml-2 rounded-full border border-white/8 bg-white/[0.04] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/45">
                {item.category}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
