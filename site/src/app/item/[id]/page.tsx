import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getItemById } from "@/lib/items-repo";
import Breadcrumbs from "@/components/breadcrumbs";
import ScoreBadge from "@/components/score-badge";
import QualityBadge from "@/components/quality-badge";
import ImagePlaceholder from "@/components/image-placeholder";

function priceToDollars(price: number | undefined): string {
  if (price == null) return "";
  if (price < 20) return "$";
  if (price < 50) return "$$";
  if (price < 100) return "$$$";
  return "$$$$";
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItemById(Number(id));
  if (!item) return { title: "Not Found — BestInSeattle" };
  return {
    title: `${item.title} — BestInSeattle`,
    description: `${item.category} in ${item.zone}. Curated by BestInSeattle.`,
    openGraph: {
      title: item.title,
      description: `${item.category} in ${item.zone}`,
      images: item.metadata?.thumbnail_url ? [{ url: item.metadata.thumbnail_url }] : [],
    },
  };
}

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItemById(Number(id));
  if (!item) notFound();

  const thumb = item.metadata?.thumbnail_url;
  const booking = item.metadata?.booking_url;
  const price = item.metadata?.est_price;
  const dollars = priceToDollars(price);
  const city = item.metadata?.city ?? "Seattle";

  const typeLabel = item.item_type === "event" ? "Events" : item.item_type === "restaurant" ? "Restaurants" : "Places";

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <Breadcrumbs
        segments={[
          { label: typeLabel, href: item.item_type === "event" ? "/events" : "/best-of/restaurants" },
          { label: item.title },
        ]}
      />

      <div className="relative overflow-hidden rounded-2xl bg-placeholder-bg">
        {thumb ? (
          <div className="relative h-64 md:h-96">
            <Image
              src={thumb}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 900px"
              priority
              unoptimized
            />
            <div className="absolute bottom-3 right-3">
              <ScoreBadge score={item.score} size="lg" />
            </div>
            <div className="absolute left-3 top-3">
              <QualityBadge score={item.metadata?.quality_score} sponsored={item.sponsored} />
            </div>
          </div>
        ) : (
          <div className="h-48">
            <ImagePlaceholder itemType={item.item_type} />
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted capitalize">
            {item.item_type}
          </span>
          {item.sponsored && (
            <span className="rounded-full border border-accent px-3 py-1 text-xs text-accent">
              Sponsored
            </span>
          )}
        </div>

        <h1 className="mt-4 text-4xl font-semibold">{item.title}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
          <span className="inline-flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {item.zone}, {city}
          </span>
          {dollars && (
            <>
              <span>·</span>
              <span className="font-medium text-foreground">{dollars}</span>
            </>
          )}
          {item.category && (
            <>
              <span>·</span>
              <span>{item.category}</span>
            </>
          )}
          {item.score != null && (
            <>
              <span>·</span>
              <span>Score: {item.score.toFixed(1)}</span>
            </>
          )}
        </div>

        <div className="mt-4 text-sm text-muted">
          Source: {item.source}
        </div>

        {item.metadata?.starts_at && (
          <div className="mt-4 rounded-lg border border-border bg-surface p-4">
            <p className="text-sm font-medium">Date</p>
            <p className="mt-1 text-muted">
              {new Date(item.metadata.starts_at).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {booking ? (
            <a
              href={booking}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
            >
              Book / View Details
            </a>
          ) : (
            <span className="inline-block rounded-full border border-border px-6 py-3 text-sm text-muted">
              Booking link coming soon
            </span>
          )}
          <Link
            href={`/zones/${item.zone.toLowerCase().replaceAll(" ", "-").replaceAll("/", "-")}`}
            className="inline-block rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
          >
            More in {item.zone}
          </Link>
        </div>
      </div>
    </div>
  );
}
