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

  useEffect(() => {
    setMounted(true);
  }, []);

  const headlineParts = timeContext.headline.split("\n");

  // Background images by mood
  const moodBg: Record<string, string> = {
    morning:
      "https://images.unsplash.com/photo-1470115636492-6d2b56f9b073?auto=format&fit=crop&w=2400&q=80",
    afternoon:
      "https://images.unsplash.com/photo-1502175353174-a7a70e73b4c3?auto=format&fit=crop&w=2400&q=80",
    evening:
      "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=2400&q=80",
    latenight:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=2400&q=80",
  };

  return (
    <section className="relative min-h-[70vh] overflow-hidden md:min-h-[60vh]">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src={hero?.thumbnailUrl || moodBg[timeContext.mood] || moodBg.evening}
          alt=""
          fill
          priority
          unoptimized
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/60 to-[#080808]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative flex h-full min-h-[70vh] flex-col justify-end pb-8 md:min-h-[60vh] md:pb-12">
        <div className="mx-auto w-full max-w-6xl px-5 md:px-10">
          {/* Time context eyebrow */}
          <p
            className={`text-[10px] font-bold uppercase tracking-[0.35em] text-[#d4af37] transition-opacity duration-700 ${
              mounted ? "opacity-100" : "opacity-0"
            }`}
          >
            Seattle &mdash; {timeContext.greeting}
          </p>

          {/* Adaptive headline */}
          <h1
            className={`mt-3 max-w-lg text-[clamp(44px,10vw,80px)] font-bold leading-[0.9] tracking-tight text-white transition-all duration-700 delay-100 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {headlineParts[0]}
            {headlineParts[1] && (
              <>
                <br />
                <span className="text-[#d4af37]">{headlineParts[1]}</span>
              </>
            )}
          </h1>

          {/* Contextual subline */}
          <p
            className={`mt-4 max-w-xs text-[14px] font-light leading-relaxed text-white/50 transition-all duration-700 delay-200 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {timeContext.subline}
            {totalEvents > 0 && (
              <span className="text-white/30">
                {" "}
                &mdash; {totalEvents} events tracked.
              </span>
            )}
          </p>

          {/* One-Tap Tonight: hero pick card */}
          {hero && (
            <div
              className={`mt-6 transition-all duration-700 delay-300 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <Link
                href={hero.bookingUrl || `/item/${hero.id}`}
                className="group inline-flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-3 pr-5 backdrop-blur-xl transition-all duration-300 hover:border-[#d4af37]/30 hover:bg-white/10"
              >
                {/* Thumbnail */}
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#1c1c1c]">
                  {hero.thumbnailUrl && (
                    <Image
                      src={hero.thumbnailUrl}
                      alt={hero.title}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="56px"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {totalLive > 0 && (
                      <span className="relative flex h-1.5 w-1.5 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                      </span>
                    )}
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#d4af37]">
                      {totalLive > 0 ? "Live Now" : "Top Pick"}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[13px] font-semibold text-white">
                    {hero.title}
                  </p>
                  <p className="truncate text-[11px] text-white/40">
                    {hero.venueName ?? hero.zone}
                    {hero.relativeTime && ` · ${hero.relativeTime}`}
                  </p>
                </div>

                {/* Go button */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d4af37] text-black transition-transform duration-200 group-hover:scale-110">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </Link>
            </div>
          )}

          {/* Quick action row */}
          <div
            className={`mt-5 flex flex-wrap items-center gap-2 transition-all duration-700 delay-[400ms] ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Link
              href="/tonight"
              className="rounded-full bg-[#d4af37] px-5 py-2.5 text-[12px] font-semibold text-black transition-all duration-200 hover:bg-[#e6c040]"
            >
              See Tonight
            </Link>
            <Link
              href="/near-me"
              className="rounded-full border border-white/15 px-5 py-2.5 text-[12px] font-medium text-white/70 backdrop-blur-sm transition-all duration-200 hover:border-white/30 hover:text-white"
            >
              Near Me
            </Link>
            <Link
              href="/events"
              className="px-3 py-2.5 text-[12px] font-medium text-white/30 transition-colors hover:text-white/60"
            >
              All Events →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
