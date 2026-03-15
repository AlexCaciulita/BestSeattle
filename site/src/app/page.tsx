import Image from "next/image";
import Link from "next/link";
import { getTonightBoard, type TonightItem } from "@/lib/tonight-repo";
import { getTimeContext } from "@/lib/time-utils";
import { pickFeatured, pickTrending } from "@/lib/ranking";
import HappeningNowTicker from "@/components/happening-now-ticker";
import SeattleMapBg from "@/components/seattle-map-bg";

export const revalidate = 300;

// ── EVENT CARD ───────────────────────────────────────────────────────────────
function EventCard({ item }: { item: TonightItem }) {
  return (
    <Link
      href={`/item/${item.id}`}
      className="group block rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-2 shadow-[var(--panel-shadow)] transition-all duration-500 hover:-translate-y-1.5 hover:border-white/16"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
        {item.thumbnailUrl ? (
          <Image
            src={item.thumbnailUrl}
            alt={item.title}
            fill
            unoptimized
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-placeholder-bg">
            <svg className="h-8 w-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
          </div>
        )}

        {item.relativeTime && (
          <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 shadow-lg backdrop-blur-xl">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-slate-950">
              <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 24 24">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
            </div>
            <span className="text-xs font-semibold tracking-tight text-white">{item.relativeTime}</span>
          </div>
        )}

        <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/55 p-2 text-white/50 shadow-lg backdrop-blur-xl transition-colors hover:text-white">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      </div>

      <div className="flex flex-grow flex-col p-5">
        <div className="mb-2 flex items-start justify-between gap-4">
          <h3 className="line-clamp-2 text-xl font-bold leading-tight tracking-tight text-foreground">
            {item.title}
          </h3>
          {item.categorySlug && (
            <div className="shrink-0 rounded-lg border border-white/8 bg-white/[0.06] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white/65">
              {item.category}
            </div>
          )}
        </div>

        <div className="mb-4 flex items-center text-sm font-medium text-muted">
          <svg className="mr-1.5 h-4 w-4 shrink-0 text-white/35" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
          </svg>
          <span className="truncate">{item.venueName ?? item.zone}</span>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="rounded-full border border-[#163826] bg-[#0b1d14] px-3 py-1.5 text-[#32d74b]">
            {item.relativeTime || "Available"}
          </span>
          {item.estPrice > 0 && (
            <>
              <span className="text-white/18">&bull;</span>
              <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-white/65">
                ${item.estPrice}
              </span>
            </>
          )}
          {item.categorySlug && (
            <>
              <span className="text-white/18">&bull;</span>
              <span className="capitalize text-white/45">
                {item.categorySlug.replace(/-/g, " ")}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default async function Home() {
  const board = await getTonightBoard();
  const timeCtx = getTimeContext();

  const allItems = [
    ...board.happeningNow,
    ...board.startingSoon,
    ...board.laterTonight,
    ...board.tomorrow,
    ...board.weekend,
    ...board.thisWeek,
  ];

  const featured = pickFeatured(allItems, 4);
  const featuredIds = new Set(featured.map((f) => f.id));
  const trending = pickTrending(allItems, featuredIds, 6);
  const totalLive = board.happeningNow.length + board.startingSoon.length;

  // Ticker items
  const tickerItems = [...board.happeningNow, ...board.startingSoon].slice(0, 20);

  return (
    <div className="relative pb-32">
      <section className="relative mx-auto max-w-[1600px] overflow-hidden px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <SeattleMapBg />
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "radial-gradient(ellipse 60% 72% at 50% 36%, rgba(255,255,255,0.14) 0%, rgba(9,11,15,0.22) 48%, rgba(6,8,11,0) 100%)",
          }}
        />
        <div className="relative z-10 mx-auto mb-10 max-w-4xl animate-fade-up text-center">
          <div className="app-chip mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/70">
              {totalLive > 0 ? `${totalLive} Live in Seattle` : "Live in Seattle"}
            </span>
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/55">
            {timeCtx.greeting}
          </p>

          <h1 className="mb-4 text-[8vw] font-bold leading-[0.85] tracking-tighter text-foreground md:text-[5vw]">
            CURATED <br />
            <span className="text-white/25">CULTURE.</span>
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-lg font-medium tracking-tight text-muted md:text-xl">
            {timeCtx.subline}
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link
              href="/tonight"
              className="button-primary rounded-full px-7 py-3 text-sm font-bold"
            >
              See Tonight
            </Link>
            <Link
              href="/events"
              className="button-secondary rounded-full px-7 py-3 text-sm font-bold"
            >
              Explore Events
            </Link>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-4 pb-16 sm:px-6 lg:px-8">
          <div className="hidden gap-5 md:grid md:h-[600px] md:grid-cols-4">
            {featured[0] && (
              <div className="poster-shadow animate-fade-up-delay-1 group relative overflow-hidden rounded-[32px] border border-white/6 md:col-span-2 md:row-span-2">
                <Image
                  src={featured[0].thumbnailUrl ?? ""}
                  alt={featured[0].title}
                  fill
                  unoptimized
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="app-chip mb-3 w-fit rounded-full px-3 py-1 text-xs font-bold text-white">Top Pick</div>
                  <h2 className="mb-2 text-3xl font-bold text-white">{featured[0].title}</h2>
                  <div className="flex items-center gap-4 text-sm text-white/75">
                    {featured[0].relativeTime && (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {featured[0].relativeTime}
                      </span>
                    )}
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                      </svg>
                      {featured[0].venueName ?? featured[0].zone}
                    </span>
                  </div>
                </div>
                <Link href={`/item/${featured[0].id}`} className="absolute inset-0 z-10"><span className="sr-only">View</span></Link>
              </div>
            )}
            {featured.slice(1, 3).map((event) => (
              <div key={event.id} className="poster-shadow group relative overflow-hidden rounded-[32px] border border-white/6 md:col-span-1 md:row-span-2">
                <Image src={event.thumbnailUrl ?? ""} alt={event.title} fill unoptimized className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" sizes="25vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/18 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="text-xl font-bold text-white mb-2 leading-tight">{event.title}</h2>
                  <p className="text-xs text-white/60">{event.venueName ?? event.zone}</p>
                </div>
                <Link href={`/item/${event.id}`} className="absolute inset-0 z-10"><span className="sr-only">View</span></Link>
              </div>
            ))}
          </div>

          <div className="md:hidden space-y-3">
            {featured[0] && (
              <div className="poster-shadow group relative min-h-[400px] overflow-hidden rounded-[32px] border border-white/6">
                <Image src={featured[0].thumbnailUrl ?? ""} alt={featured[0].title} fill unoptimized className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" sizes="100vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/18 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="app-chip mb-3 w-fit rounded-full px-3 py-1 text-xs font-bold text-white">Top Pick</div>
                  <h2 className="text-2xl font-bold text-white mb-2">{featured[0].title}</h2>
                  <p className="text-sm text-white/60">{featured[0].venueName ?? featured[0].zone}</p>
                </div>
                <Link href={`/item/${featured[0].id}`} className="absolute inset-0 z-10"><span className="sr-only">View</span></Link>
              </div>
            )}
            {featured.length > 1 && (
              <div className="grid grid-cols-2 gap-3">
                {featured.slice(1, 3).map((event) => (
                  <div key={event.id} className="poster-shadow group relative aspect-[3/4] overflow-hidden rounded-[24px] border border-white/6">
                    <Image src={event.thumbnailUrl ?? ""} alt={event.title} fill unoptimized className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" sizes="50vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/18 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h2 className="text-base font-bold text-white leading-tight line-clamp-2">{event.title}</h2>
                      <p className="mt-1 text-xs text-white/60">{event.venueName ?? event.zone}</p>
                    </div>
                    <Link href={`/item/${event.id}`} className="absolute inset-0 z-10"><span className="sr-only">View</span></Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {trending.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Trending Now</h2>
              <p className="mt-2 font-medium text-muted">Events selling out fast. Secure your spot.</p>
            </div>
            <Link href="/events" className="button-secondary hidden items-center rounded-full px-5 py-2.5 text-sm font-bold sm:flex">
              View all
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {trending.slice(0, 3).map((item) => (
              <EventCard key={`trending-${item.id}`} item={item} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Explore Seattle</h2>
            <p className="mt-2 font-medium text-muted">Curated guides for locals and visitors.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Best Restaurants", description: "From hole-in-the-wall gems to fine dining.", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80", href: "/eat" },
            { title: "Tonight in Seattle", description: "What's happening right now across the city.", image: "https://images.unsplash.com/photo-1569959220744-ff553533f492?auto=format&fit=crop&w=800&q=80", href: "/tonight" },
            { title: "Neighborhoods", description: "Capitol Hill, Ballard, Fremont — zone by zone.", image: "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?auto=format&fit=crop&w=800&q=80", href: "/zones" },
          ].map((guide) => (
            <Link key={guide.href} href={guide.href} className="poster-shadow group relative aspect-[4/5] overflow-hidden rounded-[32px] border border-white/8 transition-all duration-500 hover:-translate-y-1.5 hover:border-white/16 sm:aspect-[3/4]">
              <Image src={guide.image} alt={guide.title} fill unoptimized className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, 33vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/22 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="app-chip mb-4 w-fit rounded-full px-3 py-1 text-xs font-bold text-white">Guide</div>
                <h3 className="mb-3 text-2xl font-bold leading-tight text-white transition-colors group-hover:text-white/80">{guide.title}</h3>
                <p className="line-clamp-2 font-medium text-white/55">{guide.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {trending.length > 3 && (
        <section className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Coming Up</h2>
            <p className="mt-2 font-medium text-muted">Don&apos;t miss what&apos;s next.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {trending.slice(3, 6).map((item) => (
              <EventCard key={`coming-${item.id}`} item={item} />
            ))}
          </div>
        </section>
      )}
      {tickerItems.length > 0 && (
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
      )}
    </div>
  );
}
