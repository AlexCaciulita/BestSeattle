import Image from "next/image";
import Link from "next/link";
import { getTonightBoard, type TonightItem } from "@/lib/tonight-repo";
import { getTimeContext } from "@/lib/time-utils";
import { featuredZones } from "@/lib/zones";
import ForceTheme from "@/components/force-theme";
import TimeAwareHero from "@/components/time-aware-hero";
import HappeningNowTicker from "@/components/happening-now-ticker";
import NeighborhoodMap from "@/components/neighborhood-map";
import StickyNewsletter from "@/components/sticky-newsletter";
import MobileBottomNav from "@/components/mobile-bottom-nav";

export const revalidate = 300;

// ── CATEGORY PILLS ────────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: "All", href: "/events" },
  { label: "Concerts", href: "/events?category=concerts" },
  { label: "Sports", href: "/events?category=sports" },
  { label: "Comedy", href: "/events?category=comedy" },
  { label: "Theater", href: "/events?category=theater" },
  { label: "Family", href: "/events?category=family" },
  { label: "Arts", href: "/events?category=arts" },
  { label: "Food", href: "/best-of/restaurants" },
  { label: "Outdoors", href: "/events?category=outdoors" },
];

// ── EVENT CARD ────────────────────────────────────────────────────────────────
function EventCard({ item }: { item: TonightItem }) {
  return (
    <Link
      href={`/item/${item.id}`}
      className="group relative block w-[240px] shrink-0 overflow-hidden rounded-xl sm:w-[260px]"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <div className="relative aspect-video overflow-hidden rounded-xl bg-[#1c1c1c]">
        {item.thumbnailUrl ? (
          <Image
            src={item.thumbnailUrl}
            alt={item.title}
            fill
            unoptimized
            className="object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-110"
            sizes="260px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5">
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {item.relativeTime && (
          <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm">
            {item.relativeTime}
          </span>
        )}

        {item.categorySlug && (
          <span className="absolute right-2 top-2 rounded-full bg-[#d4af37]/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-black">
            {item.categorySlug.replace(/-/g, " ")}
          </span>
        )}

        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/0 transition-all duration-300 group-hover:ring-[#d4af37]/40" />
      </div>

      <div className="mt-2 px-0.5">
        <p className="line-clamp-1 text-[13px] font-semibold leading-snug text-[#f0f0f0]">
          {item.title}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-[#555]">
          {item.venueName ?? item.zone}
          {item.estPrice > 0 && ` · $${item.estPrice}`}
        </p>
      </div>
    </Link>
  );
}

// ── CAROUSEL ROW ──────────────────────────────────────────────────────────────
function EventRow({
  label,
  items,
  seeAllHref,
  live,
}: {
  label: string;
  items: TonightItem[];
  seeAllHref: string;
  live?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <section className="mt-8 md:mt-12">
      <div className="mb-3 flex items-center justify-between px-5 md:px-10">
        <div className="flex items-center gap-2.5">
          {live && (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
            </span>
          )}
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#888]">
            {label}
          </h2>
          <span className="text-[11px] text-[#444]">({items.length})</span>
        </div>
        <Link
          href={seeAllHref}
          className="text-[11px] font-semibold uppercase tracking-wider text-[#d4af37] transition-opacity hover:opacity-70"
        >
          See all →
        </Link>
      </div>

      <div className="carousel-fade-right">
        <div className="carousel-row pl-5 md:pl-10">
          {items.map((item) => (
            <EventCard key={item.id} item={item} />
          ))}
          <div className="w-10 shrink-0" />
        </div>
      </div>
    </section>
  );
}

// ── RESTAURANT CARD ───────────────────────────────────────────────────────────
function RestaurantCard({ item }: { item: TonightItem }) {
  return (
    <Link
      href={`/item/${item.id}`}
      className="group relative block w-[160px] shrink-0 sm:w-[180px]"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-[#1c1c1c]">
        {item.thumbnailUrl ? (
          <Image
            src={item.thumbnailUrl}
            alt={item.title}
            fill
            unoptimized
            className="object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-110"
            sizes="180px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#444]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
              <path d="M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 p-3">
          <p className="line-clamp-1 text-[12px] font-semibold text-white">{item.title}</p>
          <p className="mt-0.5 text-[10px] text-white/50">{item.category}</p>
        </div>
        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/0 transition-all duration-300 group-hover:ring-[#d4af37]/40" />
      </div>
    </Link>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default async function Home() {
  const board = await getTonightBoard();
  const timeCtx = getTimeContext();
  const hero = board.heroPick;

  const tonightItems = [
    ...board.happeningNow,
    ...board.startingSoon,
    ...board.laterTonight,
  ];
  const weekendItems = [...board.tomorrow, ...board.weekend];
  const totalLive = board.happeningNow.length + board.startingSoon.length;

  // Count events per zone for the map
  const allEvents = [
    ...board.happeningNow,
    ...board.startingSoon,
    ...board.laterTonight,
    ...board.tomorrow,
    ...board.weekend,
    ...board.thisWeek,
  ];
  const zoneCounts = new Map<string, number>();
  for (const e of allEvents) {
    const zoneSlug = e.zone
      .toLowerCase()
      .replace(/\s+\/\s+.*/, "")
      .replace(/\s+/g, "-");
    zoneCounts.set(zoneSlug, (zoneCounts.get(zoneSlug) ?? 0) + 1);
  }

  const mapZones = featuredZones.map((z) => ({
    slug: z.slug,
    label: z.label,
    eventCount: zoneCounts.get(z.slug) ?? 0,
  }));

  // Ticker items: happening now + starting soon
  const tickerItems = [...board.happeningNow, ...board.startingSoon].slice(
    0,
    20,
  );

  return (
    <>
      <ForceTheme theme="blackgold" />

      {/* ── TIME-AWARE HERO ──────────────────────────────────────────────── */}
      <TimeAwareHero
        hero={
          hero
            ? {
                id: hero.id,
                title: hero.title,
                thumbnailUrl: hero.thumbnailUrl,
                relativeTime: hero.relativeTime,
                venueName: hero.venueName,
                zone: hero.zone,
                category: hero.category,
                bookingUrl: hero.bookingUrl,
              }
            : null
        }
        timeContext={{
          mood: timeCtx.mood,
          greeting: timeCtx.greeting,
          headline: timeCtx.headline,
          subline: timeCtx.subline,
          isDark: timeCtx.isDark,
        }}
        totalLive={totalLive}
        totalEvents={board.totalEvents}
      />

      {/* ── HAPPENING NOW TICKER ─────────────────────────────────────────── */}
      <HappeningNowTicker
        items={tickerItems.map((item) => ({
          id: item.id,
          title: item.title,
          category: item.categorySlug?.replace(/-/g, " "),
          relativeTime: item.relativeTime,
          startsAt: item.startsAt,
          venueName: item.venueName,
          zone: item.zone,
        }))}
      />

      {/* ── PULSE STATS ──────────────────────────────────────────────────── */}
      {board.totalEvents > 0 && (
        <div className="bg-[#080808]">
          <div className="mx-auto grid max-w-6xl grid-cols-4 px-5 py-4 md:px-10">
            {[
              {
                n: board.happeningNow.length,
                label: "Live",
                href: "/tonight",
                color: board.happeningNow.length > 0 ? "#22c55e" : "#d4af37",
              },
              {
                n: board.startingSoon.length,
                label: "Soon",
                href: "/tonight",
                color: "#d4af37",
              },
              {
                n: weekendItems.length,
                label: "Weekend",
                href: "/events/this-weekend",
                color: "#d4af37",
              },
              {
                n: board.restaurants.length,
                label: "Eats",
                href: "/best-of/restaurants",
                color: "#d4af37",
              },
            ].map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="flex flex-col items-center rounded-lg py-2 transition-colors hover:bg-white/5"
              >
                <span
                  className="text-xl font-bold tabular-nums md:text-2xl"
                  style={{ color: s.color }}
                >
                  {s.n}
                </span>
                <span className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-[#555]">
                  {s.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── EVENT ROWS ───────────────────────────────────────────────────── */}
      <div className="py-2">
        <EventRow
          label="Happening Now"
          items={tonightItems}
          seeAllHref="/tonight"
          live={board.happeningNow.length > 0}
        />

        <EventRow
          label="This Weekend"
          items={weekendItems}
          seeAllHref="/events/this-weekend"
        />

        <EventRow
          label="This Week"
          items={board.thisWeek}
          seeAllHref="/events"
        />
      </div>

      {/* ── CATEGORY STRIP ───────────────────────────────────────────────── */}
      <section className="mt-4 border-t border-[#111111] pt-6">
        <div className="px-5 md:px-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#444]">
            Browse by
          </p>
        </div>
        <div className="carousel-row mt-3 pl-5 pr-5 md:pl-10">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="shrink-0 rounded-full border border-[#222] bg-[#111] px-5 py-2.5 text-[12px] font-medium text-[#888] transition-all duration-200 hover:border-[#d4af37]/50 hover:bg-[#1a1500] hover:text-[#d4af37] active:scale-95"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ── RESTAURANT ROW ───────────────────────────────────────────────── */}
      {board.restaurants.length > 0 && (
        <section className="mt-10">
          <div className="mb-3 flex items-center justify-between px-5 md:px-10">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#888]">
              Top Restaurants
            </h2>
            <Link
              href="/best-of/restaurants"
              className="text-[11px] font-semibold uppercase tracking-wider text-[#d4af37] transition-opacity hover:opacity-70"
            >
              See all →
            </Link>
          </div>
          <div className="carousel-fade-right">
            <div className="carousel-row pl-5 md:pl-10">
              {board.restaurants.map((item) => (
                <RestaurantCard key={item.id} item={item} />
              ))}
              <div className="w-10 shrink-0" />
            </div>
          </div>
        </section>
      )}

      {/* ── NEIGHBORHOOD MAP ─────────────────────────────────────────────── */}
      <section className="mt-14 px-5 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#444]">
                Explore
              </p>
              <h2 className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#888]">
                Neighborhoods
              </h2>
            </div>
            <Link
              href="/zones"
              className="text-[11px] font-semibold uppercase tracking-wider text-[#d4af37] transition-opacity hover:opacity-70"
            >
              See all →
            </Link>
          </div>

          <NeighborhoodMap zones={mapZones} />
        </div>
      </section>

      {/* ── EDITORIAL SPLITS ─────────────────────────────────────────────── */}
      <section className="mx-auto mt-14 max-w-6xl grid grid-cols-1 gap-3 px-5 md:grid-cols-3 md:px-10">
        {[
          {
            label: "Date Night",
            title: "Best spots for two",
            href: "/best-of/date-night",
            img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
            span: "md:col-span-2",
          },
          {
            label: "Near Me",
            title: "Events around you",
            href: "/near-me",
            img: "https://images.unsplash.com/photo-1569959220744-ff553533f492?auto=format&fit=crop&w=800&q=80",
            span: "",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative overflow-hidden rounded-2xl transition-transform active:scale-[0.98] ${item.span}`}
          >
            <div className="relative h-[180px] md:h-[220px]">
              <Image
                src={item.img}
                alt={item.title}
                fill
                unoptimized
                className="object-cover transition-all duration-500 group-hover:scale-103 group-hover:brightness-110"
                sizes="(max-width: 768px) 100vw, 66vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/0 transition-all duration-300 group-hover:ring-[#d4af37]/30" />
              <div className="absolute bottom-0 left-0 p-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#d4af37]">
                  {item.label}
                </p>
                <p className="mt-1 text-[16px] font-semibold text-white">
                  {item.title}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* ── BOTTOM SPACER (mobile nav clearance) ─────────────────────────── */}
      <div className="h-24 md:h-16" />

      {/* ── FLOATING NEWSLETTER ──────────────────────────────────────────── */}
      <StickyNewsletter />

      {/* ── MOBILE BOTTOM NAV ────────────────────────────────────────────── */}
      <MobileBottomNav />
    </>
  );
}
