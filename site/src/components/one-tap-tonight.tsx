"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

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

/**
 * One-Tap Tonight — the fastest path from "I'm bored" to "I'm going."
 * Full-bleed image card, one button. Zero scrolling needed.
 */
export default function OneTapTonight({
  hero,
  totalLive,
}: {
  hero: HeroPick | null;
  totalLive: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!hero) return null;

  const href = hero.bookingUrl || `/item/${hero.id}`;

  return (
    <section
      className={`relative mx-auto max-w-6xl px-5 md:px-10 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      <Link href={href} className="group block">
        <div className="relative overflow-hidden rounded-2xl">
          {/* Full-bleed image */}
          <div className="relative aspect-[16/9] sm:aspect-[2.4/1] bg-[#111]">
            {hero.thumbnailUrl ? (
              <Image
                src={hero.thumbnailUrl}
                alt={hero.title}
                fill
                priority
                unoptimized
                className="object-cover transition-all duration-700 group-hover:scale-[1.02] group-hover:brightness-110"
                sizes="(max-width: 768px) 100vw, 1200px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a1500] to-[#080808]">
                <span className="text-[40px] opacity-20">&#127926;</span>
              </div>
            )}

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

            {/* Hover ring */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/0 transition-all duration-500 group-hover:ring-[#d4af37]/30" />
          </div>

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0 flex-1">
                {/* Badge */}
                <div className="flex items-center gap-2">
                  {totalLive > 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#22c55e]/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#22c55e] backdrop-blur-sm">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                      </span>
                      Tonight&apos;s Pick
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-[#d4af37]/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#d4af37] backdrop-blur-sm">
                      Top Pick
                    </span>
                  )}
                  {hero.relativeTime && (
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-semibold text-white/60 backdrop-blur-sm">
                      {hero.relativeTime}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 className="mt-2.5 line-clamp-2 text-[20px] font-bold leading-tight text-white sm:text-[28px]">
                  {hero.title}
                </h2>

                {/* Meta */}
                <p className="mt-1.5 text-[12px] text-white/40 sm:text-[13px]">
                  {hero.venueName ?? hero.zone}
                  <span className="mx-2 text-white/15">·</span>
                  {hero.category}
                </p>
              </div>

              {/* Go button */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[#d4af37]/40 sm:h-14 sm:w-14">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}
