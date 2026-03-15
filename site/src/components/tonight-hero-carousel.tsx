"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { TonightItem } from "@/lib/tonight-repo";
import ImagePlaceholder from "@/components/image-placeholder";

const AUTO_PLAY_MS = 6000;

export default function TonightHeroCarousel({
  items,
}: {
  items: TonightItem[];
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = items.length;

  const next = useCallback(() => {
    setActive((i) => (i + 1) % count);
  }, [count]);

  const prev = useCallback(() => {
    setActive((i) => (i - 1 + count) % count);
  }, [count]);

  // Auto-advance
  useEffect(() => {
    if (paused || count <= 1) return;
    const t = setInterval(next, AUTO_PLAY_MS);
    return () => clearInterval(t);
  }, [paused, next, count]);

  if (count === 0) return null;

  const item = items[active];

  return (
    <section
      className="relative mt-4 sm:mt-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl">
        {/* Slides */}
        <div className="relative h-[220px] sm:h-[300px] md:h-[400px]">
          {items.map((slide, idx) => (
            <Link
              key={slide.id}
              href={slide.bookingUrl || `/item/${slide.id}`}
              className={`absolute inset-0 transition-opacity duration-700 ${
                idx === active ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
              tabIndex={idx === active ? 0 : -1}
            >
              {slide.thumbnailUrl ? (
                <Image
                  src={slide.thumbnailUrl}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority={idx === 0}
                  unoptimized
                />
              ) : (
                <ImagePlaceholder itemType={slide.kind} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            </Link>
          ))}

          {/* Content overlay */}
          <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-end p-4 sm:p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {item.timeWindow === "now" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[#22c55e] backdrop-blur-md sm:px-2.5 sm:py-1 sm:text-[10px]">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                  </span>
                  Live Now
                </span>
              ) : (
                <span className="rounded-full bg-accent/90 px-2 py-0.5 text-[10px] font-bold text-black sm:px-2.5 sm:text-xs">
                  Top Pick
                </span>
              )}
              {item.relativeTime && (
                <span className="text-xs text-white/70 sm:text-sm">{item.relativeTime}</span>
              )}
              {item.categorySlug && (
                <span className="hidden rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/70 backdrop-blur-sm sm:inline-block">
                  {item.categorySlug.replace(/-/g, " ")}
                </span>
              )}
            </div>

            <h2 className="mt-1.5 line-clamp-2 text-lg font-bold text-white sm:mt-2 sm:text-2xl md:text-3xl">
              {item.title}
            </h2>
            <p className="mt-0.5 text-xs text-white/70 sm:mt-1 sm:text-sm">
              {item.venueName && `${item.venueName} · `}
              {item.zone}
              {item.estPrice > 0 && ` · ~$${item.estPrice}`}
            </p>
          </div>

          {/* Arrows — always visible on mobile (no hover), hover-reveal on desktop */}
          {count > 1 && (
            <>
              <button
                onClick={(e) => { e.preventDefault(); prev(); }}
                className="absolute left-2 top-1/2 z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white/70 backdrop-blur-sm transition-all hover:bg-black/70 hover:text-white sm:left-3 sm:h-9 sm:w-9 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Previous"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.preventDefault(); next(); }}
                className="absolute right-2 top-1/2 z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white/70 backdrop-blur-sm transition-all hover:bg-black/70 hover:text-white sm:right-3 sm:h-9 sm:w-9 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Next"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Dots + progress */}
      {count > 1 && (
        <div className="mt-2.5 flex items-center justify-center gap-2 sm:mt-3">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActive(idx)}
              className={`relative h-1.5 overflow-hidden rounded-full transition-all duration-300 ${
                idx === active ? "w-7 bg-white/30 sm:w-8" : "w-1.5 bg-white/15 hover:bg-white/25"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            >
              {idx === active && (
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-accent"
                  style={{
                    animation: paused ? "none" : `progress ${AUTO_PLAY_MS}ms linear`,
                    width: paused ? "50%" : undefined,
                  }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}
