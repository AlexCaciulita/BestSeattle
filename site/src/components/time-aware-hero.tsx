"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type HeroPick = {
  id: string;
  title: string;
  thumbnailUrl?: string;
  relativeTime?: string;
  venueName?: string;
  zone: string;
  category: string;
  bookingUrl?: string;
};

type TimeContextData = {
  mood: "morning" | "afternoon" | "evening" | "latenight";
  greeting: string;
  headline: string;
  subline: string;
  isDark: boolean;
};

// Cinematic mood backgrounds — always beautiful regardless of data quality
const MOOD_BG: Record<string, string> = {
  morning:
    "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?auto=format&fit=crop&w=2400&q=80",
  afternoon:
    "https://images.unsplash.com/photo-1516905041604-7935af78f572?auto=format&fit=crop&w=2400&q=80",
  evening:
    "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=2400&q=80",
  latenight:
    "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=2400&q=80",
};

export default function TimeAwareHero({
  hero,
  timeContext,
  totalLive,
  totalEvents,
}: {
  hero: HeroPick | null;
  timeContext: TimeContextData;
  totalLive: number;
  totalEvents: number;
}) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const headlineParts = timeContext.headline.split("\n");
  const timeStr = now
    ? now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "America/Los_Angeles",
      })
    : "";

  const bgImage = MOOD_BG[timeContext.mood] || MOOD_BG.evening;

  return (
    <section className="relative overflow-hidden">
      {/* Cinematic background — mood-based city image */}
      <div className="absolute inset-0">
        <Image
          src={bgImage}
          alt=""
          fill
          priority
          unoptimized
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-[#050505]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/90 via-[#050505]/40 to-transparent" />
        <div className="absolute inset-0 bg-[#050505]/30" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 pb-6 pt-5 md:px-10 md:pb-8 md:pt-6">
        {/* Top bar: city + live clock */}
        <div
          className={`flex items-center justify-between transition-opacity duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}
        >
          <div className="flex items-center gap-3">
            {totalLive > 0 && (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
              </span>
            )}
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d4af37]">
              Seattle
            </span>
            <span className="text-[10px] text-white/20">/</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
              {timeContext.greeting}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {totalLive > 0 && (
              <Link
                href="/tonight"
                className="flex items-center gap-1.5 rounded-full bg-[#22c55e]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#22c55e] transition-colors hover:bg-[#22c55e]/20"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                </span>
                {totalLive} live
              </Link>
            )}
            <span className="font-mono text-[11px] tabular-nums text-white/25">
              {timeStr}
            </span>
          </div>
        </div>

        {/* Main: headline left + hero card right on desktop */}
        <div className="mt-5 flex flex-col gap-5 md:mt-6 md:flex-row md:items-end md:justify-between md:gap-10">
          {/* Left: headline */}
          <div
            className={`flex-1 transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
          >
            <h1 className="text-[clamp(42px,9vw,68px)] font-bold leading-[0.9] tracking-tight text-white">
              {headlineParts[0]}
              {headlineParts[1] && (
                <>
                  <br />
                  <span className="text-[#d4af37]">{headlineParts[1]}</span>
                </>
              )}
            </h1>
            <p className="mt-4 max-w-xs text-[13px] font-light leading-relaxed text-white/40">
              {timeContext.subline}
              {totalEvents > 0 && (
                <span className="text-white/20">
                  {" "}&mdash; {totalEvents} events tracked.
                </span>
              )}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <Link
                href="/tonight"
                className="rounded-full bg-[#d4af37] px-6 py-2.5 text-[12px] font-semibold text-black transition-all duration-200 hover:bg-[#e6c040] hover:shadow-lg hover:shadow-[#d4af37]/20"
              >
                See Tonight
              </Link>
              <Link
                href="/near-me"
                className="rounded-full border border-white/15 px-5 py-2.5 text-[12px] font-medium text-white/60 backdrop-blur-sm transition-all duration-200 hover:border-white/30 hover:text-white"
              >
                Near Me
              </Link>
              <Link
                href="/events"
                className="px-3 py-2.5 text-[12px] font-medium text-white/25 transition-colors hover:text-white/50"
              >
                All Events &rarr;
              </Link>
            </div>
          </div>

          {/* Right: hero pick card */}
          {hero && (
            <div
              className={`w-full shrink-0 md:w-[340px] transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <Link
                href={hero.bookingUrl || `/item/${hero.id}`}
                className="group block overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.04] backdrop-blur-xl transition-all duration-300 hover:border-[#d4af37]/20 hover:bg-white/[0.07]"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-[#0a0a0a]">
                  {hero.thumbnailUrl && (
                    <Image
                      src={hero.thumbnailUrl}
                      alt={hero.title}
                      fill
                      unoptimized
                      className="object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-110"
                      sizes="340px"
                    />
                  )}
                  {/* Heavy overlay so even bad Ticketmaster logos look acceptable */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />

                  <div className="absolute left-3 top-3">
                    {totalLive > 0 ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-[#22c55e] backdrop-blur-md">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                        </span>
                        Tonight&apos;s Pick
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-black/60 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-[#d4af37] backdrop-blur-md">
                        Top Pick
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="line-clamp-2 text-[15px] font-bold leading-tight text-white">
                      {hero.title}
                    </p>
                    <p className="mt-1 text-[11px] text-white/40">
                      {hero.venueName ?? hero.zone}
                      {hero.relativeTime && (
                        <span className="ml-2 text-[#d4af37]/70">{hero.relativeTime}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
                    {hero.category}
                  </span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d4af37] text-black transition-transform duration-200 group-hover:scale-110">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
