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
        setLabel(`${h}h ${m}m`);
      } else {
        setLabel("");
      }
    }

    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, [startsAt]);

  if (!label) return null;

  const isLive = label === "LIVE";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        isLive
          ? "bg-[#22c55e]/20 text-[#22c55e]"
          : "bg-[#d4af37]/15 text-[#d4af37]"
      }`}
    >
      {isLive && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
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

  // Double items for seamless infinite scroll
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-[#1a1a1a] bg-[#0a0a0a]">
      {/* Left label */}
      <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a] to-transparent pl-4 pr-8 md:pl-6 md:pr-12">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#22c55e]">
            Now
          </span>
        </div>
      </div>

      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none" />

      {/* Scrolling ticker */}
      <div className="ticker-scroll flex items-center gap-6 py-3 pl-24 md:pl-32">
        {doubled.map((item, i) => (
          <Link
            key={`${item.id}-${i}`}
            href={`/item/${item.id}`}
            className="group flex shrink-0 items-center gap-3 rounded-lg px-3 py-1.5 transition-colors hover:bg-white/5"
          >
            {item.startsAt && <CountdownTimer startsAt={item.startsAt} />}
            <span className="max-w-[200px] truncate text-[12px] font-medium text-[#ccc] transition-colors group-hover:text-white">
              {item.title}
            </span>
            <span className="hidden text-[10px] text-[#444] sm:inline">
              {item.venueName ?? item.zone}
            </span>
            {item.category && (
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-[#666]">
                {item.category}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
