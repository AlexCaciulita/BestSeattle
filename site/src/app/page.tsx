import Image from "next/image";
import Link from "next/link";
import { getTonightBoard, type TonightItem } from "@/lib/tonight-repo";
import { getTimePeriodLabel } from "@/lib/time-utils";
import { featuredZones } from "@/lib/zones";
import ForceTheme from "@/components/force-theme";
import NewsletterForm from "@/components/newsletter-form";

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

// ── CARD ──────────────────────────────────────────────────────────────────────
function EventCard({ item }: { item: TonightItem }) {
  return (
    <Link
      href={`/item/${item.id}`}
      className="group relative block w-[260px] shrink-0 overflow-hidden rounded-xl"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {/* Image */}
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

        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Time badge */}
        {item.relativeTime && (
          <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm">
            {item.relativeTime}
          </span>
        )}

        {/* Category badge */}
        {item.categorySlug && (
          <span className="absolute right-2 top-2 rounded-full bg-[#d4af37]/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-black">
            {item.categorySlug.replace(/-/g, " ")}
          </span>
        )}

        {/* Hover glow ring */}
        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/0 transition-all duration-300 group-hover:ring-[#d4af37]/40" />
      </div>

      {/* Text */}
      <div className="mt-2.5 px-0.5">
        <p className="line-clamp-1 text-[13px] font-semibold leading-snug text-[#f0f0f0]">
          {item.title}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-[#666]">
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
    <section className="mt-10 md:mt-14">
      {/* Row header */}
      <div className="mb-4 flex items-center justify-between px-6 md:px-10">
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

      {/* Carousel */}
      <div className="carousel-fade-right">
        <div className="carousel-row pl-6 md:pl-10">
          {items.map((item) => (
            <EventCard key={item.id} item={item} />
          ))}
          {/* Spacer at end so last card doesn't hide behind fade */}
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
      className="group relative block w-[200px] shrink-0"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-[#1c1c1c]">
        {item.thumbnailUrl ? (
          <Image
            src={item.thumbnailUrl}
            alt={item.title}
            fill
            unoptimized
            className="object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-110"
            sizes="200px"
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
  const periodLabel = getTimePeriodLabel();
  const hero = board.heroPick;

  const tonightItems = [
    ...board.happeningNow,
    ...board.startingSoon,
    ...board.laterTonight,
  ];
  const weekendItems = [...board.tomorrow, ...board.weekend];
  const totalLive = board.happeningNow.length + board.startingSoon.length;

  return (
    <>
      <ForceTheme theme="blackgold" />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] overflow-hidden">
        {/* Background: deep cinematic image */}
        <div className="absolute inset-0">
          {hero?.thumbnailUrl ? (
            <Image
              src={hero.thumbnailUrl}
              alt=""
              fill
              priority
              unoptimized
              className="object-cover"
              sizes="100vw"
            />
          ) : (
            <Image
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2400&q=80"
              alt="Seattle"
              fill
              priority
              unoptimized
              className="object-cover"
              sizes="100vw"
            />
          )}

          {/* Multi-layer dark gradients for cinematic depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/55 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/75 via-[#080808]/20 to-transparent" />
          <div className="absolute inset-0 bg-[#080808]/20" />
        </div>

        {/* Hero content */}
        <div className="relative flex h-full min-h-[88vh] flex-col justify-end pb-16 md:pb-20">
          <div className="mx-auto w-full max-w-6xl px-6 md:px-10">

            {/* Eyebrow */}
            <p
              className="animate-fade-up text-[10px] font-bold uppercase tracking-[0.35em] text-[#d4af37]"
            >
              Seattle &mdash; {periodLabel}
            </p>

            {/* Giant headline */}
            <h1
              className="animate-fade-up-delay-1 mt-4 max-w-2xl text-[clamp(52px,8vw,96px)] font-bold leading-[0.9] tracking-tight text-white"
            >
              What&apos;s<br />
              <span style={{ color: "#d4af37" }}>Tonight</span>
            </h1>

            {/* Subline */}
            <p
              className="animate-fade-up-delay-2 mt-5 max-w-sm text-[15px] font-light leading-relaxed text-white/50"
            >
              {board.totalEvents > 0
                ? `${board.totalEvents} events curated for Seattle right now.`
                : "Discover what's actually worth doing."}
            </p>

            {/* CTAs */}
            <div className="animate-fade-up-delay-3 mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/tonight"
                className="group relative overflow-hidden rounded-full bg-[#d4af37] px-7 py-3 text-[13px] font-semibold text-black transition-all duration-300 hover:bg-[#e6c040]"
              >
                See Tonight&apos;s Picks
              </Link>
              <Link
                href="/near-me"
                className="rounded-full border border-white/20 px-7 py-3 text-[13px] font-medium text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:text-white"
              >
                Near Me
              </Link>
              <Link
                href="/events"
                className="text-[13px] font-medium text-white/40 transition-colors hover:text-white/70"
              >
                All Events →
              </Link>
            </div>

            {/* Now-playing featured event */}
            {hero && (
              <Link
                href={`/item/${hero.id}`}
                className="animate-fade-up-delay-3 mt-10 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/10"
              >
                {totalLive > 0 && (
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                  </span>
                )}
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37]">
                  {totalLive > 0 ? "Live Now" : "Top Pick"}
                </span>
                <span className="max-w-[260px] truncate text-[13px] font-medium text-white/90">
                  {hero.title}
                </span>
                {hero.relativeTime && (
                  <span className="shrink-0 text-[11px] text-white/30">
                    {hero.relativeTime}
                  </span>
                )}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-white/30">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      {board.totalEvents > 0 && (
        <div className="border-y border-[#1a1a1a] bg-[#0e0e0e]">
          <div className="mx-auto flex max-w-6xl divide-x divide-[#1a1a1a] overflow-x-auto px-6 md:px-10 no-scrollbar">
            {[
              { n: board.happeningNow.length, label: "Now", href: "/tonight", hot: true },
              { n: board.startingSoon.length, label: "Starting Soon", href: "/tonight" },
              { n: weekendItems.length, label: "This Weekend", href: "/events/this-weekend" },
              { n: board.restaurants.length, label: "Restaurants", href: "/best-of/restaurants" },
            ].map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="flex shrink-0 flex-col px-6 py-5 transition-colors hover:bg-[#111111]"
              >
                <span
                  className="text-2xl font-bold"
                  style={{ color: s.hot && s.n > 0 ? "#22c55e" : "#d4af37" }}
                >
                  {s.n}
                </span>
                <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-[#555]">
                  {s.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── EVENT CAROUSEL ROWS ───────────────────────────────────────────── */}
      <div className="py-4">
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

      {/* ── CATEGORY STRIP ────────────────────────────────────────────────── */}
      <section className="mt-6 border-t border-[#111111] pt-8">
        <div className="px-6 md:px-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#444]">Browse by</p>
        </div>
        <div className="carousel-row mt-4 pl-6 pr-6 md:pl-10">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="shrink-0 rounded-full border border-[#222] bg-[#111] px-5 py-2.5 text-[12px] font-medium text-[#888] transition-all duration-200 hover:border-[#d4af37]/50 hover:bg-[#1a1500] hover:text-[#d4af37]"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ── RESTAURANT ROW ────────────────────────────────────────────────── */}
      {board.restaurants.length > 0 && (
        <section className="mt-12">
          <div className="mb-4 flex items-center justify-between px-6 md:px-10">
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
            <div className="carousel-row pl-6 md:pl-10">
              {board.restaurants.map((item) => (
                <RestaurantCard key={item.id} item={item} />
              ))}
              <div className="w-10 shrink-0" />
            </div>
          </div>
        </section>
      )}

      {/* ── NEIGHBORHOODS ─────────────────────────────────────────────────── */}
      <section className="mt-14">
        <div className="mb-4 flex items-center justify-between px-6 md:px-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#444]">Explore</p>
            <h2 className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#888]">
              By Neighborhood
            </h2>
          </div>
          <Link
            href="/zones"
            className="text-[11px] font-semibold uppercase tracking-wider text-[#d4af37] transition-opacity hover:opacity-70"
          >
            See all →
          </Link>
        </div>
        <div className="carousel-fade-right">
          <div className="carousel-row pl-6 md:pl-10">
            {featuredZones.map((zone) => (
              <Link
                key={zone.slug}
                href={`/zones/${zone.slug}`}
                className="group relative block w-[180px] shrink-0 overflow-hidden rounded-xl"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-[#1c1c1c]">
                  <Image
                    src={zone.image}
                    alt={zone.label}
                    fill
                    unoptimized
                    className="object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-110"
                    sizes="180px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/0 transition-all duration-300 group-hover:ring-[#d4af37]/40" />
                  <div className="absolute bottom-0 left-0 p-3">
                    <p className="text-[12px] font-semibold leading-tight text-white">
                      {zone.label.split(" /")[0]}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            <div className="w-10 shrink-0" />
          </div>
        </div>
      </section>

      {/* ── EDITORIAL SPLITS ──────────────────────────────────────────────── */}
      <section className="mx-auto mt-16 max-w-6xl grid grid-cols-1 gap-4 px-6 md:grid-cols-3 md:px-10">
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
            className={`group relative overflow-hidden rounded-2xl ${item.span}`}
          >
            <div className="relative h-[220px] md:h-[260px]">
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
              <div className="absolute bottom-0 left-0 p-6">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#d4af37]">
                  {item.label}
                </p>
                <p className="mt-1.5 text-[18px] font-semibold text-white">{item.title}</p>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* ── NEWSLETTER ────────────────────────────────────────────────────── */}
      <section className="mx-auto mt-16 max-w-xl px-6 pb-20 text-center md:px-10">
        <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#444]">
          Stay Ahead
        </p>
        <h2 className="mt-3 text-[28px] font-bold leading-tight text-[#f0f0f0]">
          Seattle&apos;s best,<br />in your inbox.
        </h2>
        <p className="mx-auto mt-3 max-w-xs text-[13px] leading-relaxed text-[#555]">
          Weekly picks — events, restaurants, and local gems. No noise.
        </p>
        <div className="mt-8">
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
