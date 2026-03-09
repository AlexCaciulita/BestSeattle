import Link from "next/link";
import Image from "next/image";
import type { Item } from "@/lib/items-repo";
import ScoreBadge from "./score-badge";
import QualityBadge from "./quality-badge";
import ImagePlaceholder from "./image-placeholder";

type Props = {
  item: Item;
  showZone?: boolean;
  variant?: "grid" | "list";
};

function priceToDollars(price: number | undefined): string {
  if (price == null) return "";
  if (price < 20) return "$";
  if (price < 50) return "$$";
  if (price < 100) return "$$$";
  return "$$$$";
}

export default function ItemCard({ item, showZone = true, variant = "grid" }: Props) {
  const thumb = item.metadata?.thumbnail_url;
  const price = item.metadata?.est_price;
  const dollars = priceToDollars(price);

  if (variant === "list") {
    return (
      <Link href={`/item/${item.id}`} className="block">
        <article className="grid overflow-hidden rounded-xl transition-colors hover:bg-surface-hover md:grid-cols-[220px_1fr]">
          <div className="relative h-40 bg-placeholder-bg md:h-full md:rounded-xl">
            {thumb ? (
              <Image
                src={thumb}
                alt={item.title}
                fill
                className="object-cover md:rounded-xl"
                sizes="(max-width: 768px) 100vw, 220px"
                unoptimized
              />
            ) : (
              <ImagePlaceholder itemType={item.item_type} className="md:rounded-xl" />
            )}
            <div className="absolute left-2.5 top-2.5">
              <QualityBadge score={item.metadata?.quality_score} sponsored={item.sponsored} />
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="line-clamp-1 flex-1 text-base font-semibold leading-snug text-foreground">
                {item.title}
              </h3>
              <ScoreBadge score={item.score} />
            </div>
            {showZone && (
              <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-accent">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
                </svg>
                {item.zone}
              </p>
            )}
            <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-muted">
              {dollars && <span>{dollars}</span>}
              {dollars && item.category && <span>·</span>}
              {item.category && <span>{item.category}</span>}
            </p>
          </div>
        </article>
      </Link>
    );
  }

  // Grid variant (default) — matches BestDubai card style
  return (
    <Link href={`/item/${item.id}`} className="block">
      <article className="group">
        <div className="relative overflow-hidden rounded-xl bg-placeholder-bg">
          <div className="relative aspect-[4/3]">
            {thumb ? (
              <Image
                src={thumb}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                unoptimized
              />
            ) : (
              <ImagePlaceholder itemType={item.item_type} />
            )}
          </div>
          <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
            <QualityBadge score={item.metadata?.quality_score} sponsored={item.sponsored} />
            {item.category_slug && item.item_type === "event" && (
              <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium capitalize text-white backdrop-blur-sm">
                {item.category_slug.replace(/-/g, " ")}
              </span>
            )}
          </div>
        </div>

        <div className="px-0.5 pt-3">
          {/* Title + score on same row */}
          <div className="flex items-center gap-2">
            <h3 className="line-clamp-1 flex-1 text-[15px] font-semibold leading-snug text-foreground">
              {item.title}
            </h3>
            <ScoreBadge score={item.score} />
          </div>

          {/* Location */}
          {showZone && (
            <p className="mt-1 flex items-center gap-1 text-sm text-muted">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-accent">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
              </svg>
              {item.zone}
            </p>
          )}

          {/* Price + cuisine */}
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-sm text-muted">
            {dollars && <span>{dollars}</span>}
            {dollars && item.category && <span>·</span>}
            {item.category && <span>{item.category}</span>}
          </p>
        </div>
      </article>
    </Link>
  );
}
