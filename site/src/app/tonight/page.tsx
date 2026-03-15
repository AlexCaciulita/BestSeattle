import Image from "next/image";
import Link from "next/link";
import { getTonightBoard } from "@/lib/tonight-repo";
import { getTimePeriodLabel } from "@/lib/time-utils";
import type { TonightItem } from "@/lib/tonight-repo";
import ImagePlaceholder from "@/components/image-placeholder";
import Breadcrumbs from "@/components/breadcrumbs";
import TonightHeroCarousel from "@/components/tonight-hero-carousel";

export const revalidate = 300;

export const metadata = {
  title: "Tonight — BestInSeattle",
  description: "What's actually worth doing tonight in Seattle — with booking links.",
};

function Section({
  title,
  items,
  accent,
}: {
  title: string;
  items: TonightItem[];
  accent?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <section className="mt-8 sm:mt-10">
      <div className="flex items-center gap-3">
        {accent && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-open opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-status-open" />
          </span>
        )}
        <h2 className="text-xl font-semibold sm:text-2xl">{title}</h2>
        <span className="text-sm text-muted">({items.length})</span>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link key={`${title}-${item.id}`} href={item.bookingUrl || `/item/${item.id}`} className="group block">
            <article>
              <div className="relative overflow-hidden rounded-xl bg-placeholder-bg">
                <div className="relative aspect-[16/9] sm:aspect-[4/3]">
                  {item.thumbnailUrl ? (
                    <Image
                      src={item.thumbnailUrl}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized
                    />
                  ) : (
                    <ImagePlaceholder itemType={item.kind} />
                  )}
                </div>
                {item.relativeTime && (
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                    {item.relativeTime}
                  </span>
                )}
                {item.categorySlug && (
                  <span className="absolute right-2.5 top-2.5 rounded-full bg-accent/90 px-2 py-0.5 text-[10px] font-semibold text-black capitalize">
                    {item.categorySlug.replace(/-/g, " ")}
                  </span>
                )}
              </div>
              <div className="pt-3">
                <h3 className="line-clamp-2 text-[15px] font-semibold text-foreground sm:line-clamp-1">
                  {item.title}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-accent">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
                  </svg>
                  <span className="truncate">
                    {item.venueName ? `${item.venueName} · ${item.zone}` : item.zone}
                  </span>
                </p>
                <p className="mt-0.5 text-sm text-muted">
                  {item.estPrice > 0 && `~$${item.estPrice}`}
                  {item.estPrice > 0 && item.category && " · "}
                  {item.category}
                </p>
                {item.bookingUrl && (
                  <span className="mt-2 inline-block rounded-full border border-accent px-3 py-1 text-xs font-semibold text-accent">
                    Tickets Available
                  </span>
                )}
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function TonightPage() {
  const board = await getTonightBoard();
  const periodLabel = getTimePeriodLabel();

  const totalTonight =
    board.happeningNow.length + board.startingSoon.length + board.laterTonight.length;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 md:pb-8 md:pt-8">
      <Breadcrumbs segments={[{ label: "Tonight" }]} />

      <div className="mt-3 sm:mt-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold sm:text-4xl">Tonight in Seattle</h1>
            <p className="mt-1 text-sm text-muted sm:mt-2 sm:text-base">
              {periodLabel} — {totalTonight > 0 ? `${totalTonight} events tonight` : "curated picks with booking links"}
            </p>
          </div>
          <Link href="/events" className="shrink-0 text-sm font-medium text-accent hover:underline">
            All events →
          </Link>
        </div>
      </div>

      {/* Hero carousel — top picks */}
      {board.heroCarousel.length > 0 && (
        <TonightHeroCarousel items={board.heroCarousel} />
      )}

      {/* All events by time window */}
      <Section title="Happening Now" items={board.happeningNow} accent />
      <Section title="Starting Soon" items={board.startingSoon} />
      <Section title="Later Tonight" items={board.laterTonight} />

      {totalTonight === 0 && (
        <section className="mt-8 rounded-xl border border-border bg-surface p-6 text-center sm:mt-10 sm:p-8">
          <p className="text-lg font-medium">Nothing scheduled tonight yet</p>
          <p className="mt-2 text-sm text-muted">
            Check out <Link href="/events/this-weekend" className="text-accent hover:underline">this weekend</Link> or{" "}
            <Link href="/events" className="text-accent hover:underline">browse all events</Link>.
          </p>
        </section>
      )}

      {/* Restaurant picks */}
      {board.restaurants.length > 0 && (
        <section className="mt-10 sm:mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold sm:text-2xl">Date Night Restaurants</h2>
            <Link href="/eat" className="shrink-0 text-sm font-medium text-accent hover:underline">
              View all →
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {board.restaurants.slice(0, 4).map((item) => (
              <Link key={item.id} href={`/item/${item.id}`} className="group block">
                <article>
                  <div className="relative overflow-hidden rounded-xl bg-placeholder-bg">
                    <div className="relative aspect-[4/3]">
                      {item.thumbnailUrl ? (
                        <Image
                          src={item.thumbnailUrl}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, 25vw"
                          unoptimized
                        />
                      ) : (
                        <ImagePlaceholder itemType={item.kind} />
                      )}
                    </div>
                  </div>
                  <div className="pt-2 sm:pt-3">
                    <h3 className="line-clamp-1 text-sm font-semibold sm:text-[15px]">{item.title}</h3>
                    <p className="mt-0.5 text-xs text-muted sm:text-sm">{item.category} · {item.zone}</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
