import Link from "next/link";
import Image from "next/image";
import { getTonightBoard } from "@/lib/tonight-repo";
import { getTimeGreeting, getTimePeriodLabel } from "@/lib/time-utils";
import { featuredZones } from "@/lib/zones";
import TimeTabs from "@/components/homepage/time-tabs";
import ImagePlaceholder from "@/components/image-placeholder";
import NewsletterForm from "@/components/newsletter-form";

export const revalidate = 300; // Refresh every 5 minutes

export default async function Home() {
  const board = await getTonightBoard();
  const { greeting } = getTimeGreeting();
  const periodLabel = getTimePeriodLabel();
  const hero = board.heroPick;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      {/* Hero section */}
      <section className="relative overflow-hidden rounded-2xl">
        {hero?.thumbnailUrl ? (
          <div className="relative h-[340px] md:h-[420px]">
            <Image
              src={hero.thumbnailUrl}
              alt={hero.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
              <p className="text-sm font-medium text-white/70">{periodLabel}</p>
              <h1 className="mt-2 max-w-2xl text-4xl font-bold leading-tight text-white md:text-5xl">
                {greeting}, Seattle
              </h1>
              <p className="mt-3 max-w-xl text-base text-white/80">
                {board.totalEvents > 0
                  ? `${board.totalEvents} events curated for you right now.`
                  : "Discover what's actually worth doing."}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/tonight"
                  className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90"
                >
                  See Tonight&apos;s Picks
                </Link>
                <Link
                  href="/near-me"
                  className="rounded-full border border-white/30 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  Near Me
                </Link>
                <Link
                  href="/events"
                  className="rounded-full border border-white/30 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  All Events
                </Link>
              </div>

              {/* Hero pick callout */}
              {hero && (
                <Link
                  href={`/item/${hero.id}`}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <span className="text-xs font-medium text-accent">Featured</span>
                  <span className="text-sm font-medium text-white">{hero.title}</span>
                  {hero.relativeTime && (
                    <span className="text-xs text-white/60">{hero.relativeTime}</span>
                  )}
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="border border-border bg-surface p-10">
            <p className="text-sm uppercase tracking-[0.2em] text-muted">{periodLabel}</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight tracking-tight">
              {greeting}, Seattle
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted">
              {board.totalEvents > 0
                ? `${board.totalEvents} events curated for you right now.`
                : "Discover what's actually worth doing."}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/tonight" className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-black">
                See Tonight&apos;s Picks
              </Link>
              <Link href="/near-me" className="rounded-full border border-border px-6 py-3 text-sm font-semibold">
                Near Me
              </Link>
              <Link href="/events" className="rounded-full border border-border px-6 py-3 text-sm font-semibold">
                All Events
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Quick stats bar */}
      <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          {
            label: "Happening Now",
            count: board.happeningNow.length,
            href: "/tonight",
            color: "text-status-open",
          },
          {
            label: "Starting Soon",
            count: board.startingSoon.length,
            href: "/tonight",
            color: "text-accent",
          },
          {
            label: "This Weekend",
            count: board.weekend.length + board.tomorrow.length,
            href: "/events/this-weekend",
            color: "text-foreground",
          },
          {
            label: "Restaurants",
            count: board.restaurants.length,
            href: "/best-of/restaurants",
            color: "text-foreground",
          },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent"
          >
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
            <p className="mt-1 text-xs text-muted">{stat.label}</p>
          </Link>
        ))}
      </section>

      {/* Time-aware tabs: Tonight / Weekend / Week */}
      <section className="mt-10">
        <TimeTabs board={board} />
      </section>

      {/* Featured editorial links */}
      <section className="mt-12 grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Best date-night spots",
            href: "/best-of/date-night",
            image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
          },
          {
            title: "Top restaurants",
            href: "/best-of/restaurants",
            image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
          },
          {
            title: "Find events near me",
            href: "/near-me",
            image: "https://images.unsplash.com/photo-1569959220744-ff553533f492?auto=format&fit=crop&w=800&q=80",
          },
        ].map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group relative overflow-hidden rounded-xl border border-border"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <p className="text-xs text-white/70">Editor&apos;s pick</p>
                <h3 className="mt-1 text-lg font-semibold text-white">{item.title}</h3>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* Zones */}
      <section className="mt-10 rounded-2xl border border-border bg-surface p-8">
        <h2 className="text-2xl font-semibold">Explore by Zone</h2>
        <p className="mt-2 text-muted">Go granular by neighborhood and nearby PNW hubs.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredZones.map((zone) => (
            <Link
              key={zone.slug}
              href={`/zones/${zone.slug}`}
              className="group relative overflow-hidden rounded-xl"
            >
              <div className="relative aspect-[3/2]">
                <Image
                  src={zone.image}
                  alt={zone.label}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-3">
                  <p className="text-sm font-semibold text-white">{zone.label}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-4 text-right">
          <Link href="/zones" className="text-sm font-medium text-accent hover:underline">
            View all zones →
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="mt-10 rounded-2xl border border-border bg-surface p-8 text-center">
        <h2 className="text-2xl font-semibold">Stay in the loop</h2>
        <p className="mx-auto mt-2 max-w-md text-muted">
          Weekly curated picks for Seattle — events, restaurants, and things worth doing. No spam.
        </p>
        <div className="mx-auto mt-6 max-w-md">
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
