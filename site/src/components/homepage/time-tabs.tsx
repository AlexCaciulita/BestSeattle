"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { TonightItem, TonightBoard } from "@/lib/tonight-repo";
import ImagePlaceholder from "@/components/image-placeholder";

type Tab = "tonight" | "weekend" | "week";

type Props = {
  board: TonightBoard;
};

function EventCard({ item }: { item: TonightItem }) {
  return (
    <Link href={`/item/${item.id}`} className="group block">
      <article>
        <div className="relative overflow-hidden rounded-xl bg-placeholder-bg">
          <div className="relative aspect-[4/3]">
            {item.thumbnailUrl ? (
              <Image
                src={item.thumbnailUrl}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
        <div className="px-0.5 pt-3">
          <h3 className="line-clamp-1 text-[15px] font-semibold text-foreground">
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
        </div>
      </article>
    </Link>
  );
}

function TimeSection({
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
    <div className="mt-8">
      <div className="flex items-center gap-3">
        {accent && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-open opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-status-open" />
          </span>
        )}
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <span className="text-sm text-muted">({items.length})</span>
      </div>
      <div className="mt-4 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 9).map((item) => (
          <EventCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function TimeTabs({ board }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("tonight");

  const tabs: { key: Tab; label: string; count: number }[] = [
    {
      key: "tonight",
      label: "Tonight",
      count:
        board.happeningNow.length +
        board.startingSoon.length +
        board.laterTonight.length,
    },
    {
      key: "weekend",
      label: "This Weekend",
      count: board.weekend.length + board.tomorrow.length,
    },
    {
      key: "week",
      label: "This Week",
      count: board.thisWeek.length,
    },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-border bg-surface p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-accent text-black"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1.5 text-xs ${activeTab === tab.key ? "text-black/60" : "text-muted"}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-2">
        {activeTab === "tonight" && (
          <>
            <TimeSection title="Happening Now" items={board.happeningNow} accent />
            <TimeSection title="Starting Soon" items={board.startingSoon} />
            <TimeSection title="Later Tonight" items={board.laterTonight} />
            {board.happeningNow.length + board.startingSoon.length + board.laterTonight.length === 0 && (
              <div className="mt-8 rounded-xl border border-border bg-surface p-8 text-center">
                <p className="text-lg font-medium text-foreground">Nothing scheduled tonight yet</p>
                <p className="mt-2 text-sm text-muted">Check out this weekend or browse all events.</p>
              </div>
            )}
          </>
        )}

        {activeTab === "weekend" && (
          <>
            <TimeSection title="Tomorrow" items={board.tomorrow} />
            <TimeSection title="Weekend Events" items={board.weekend} />
            {board.tomorrow.length + board.weekend.length === 0 && (
              <div className="mt-8 rounded-xl border border-border bg-surface p-8 text-center">
                <p className="text-lg font-medium text-foreground">Weekend events loading...</p>
                <p className="mt-2 text-sm text-muted">Check back soon or browse all events.</p>
              </div>
            )}
          </>
        )}

        {activeTab === "week" && (
          <>
            <TimeSection title="This Week" items={board.thisWeek} />
            {board.thisWeek.length === 0 && (
              <div className="mt-8 rounded-xl border border-border bg-surface p-8 text-center">
                <p className="text-lg font-medium text-foreground">More events coming soon</p>
                <p className="mt-2 text-sm text-muted">We&apos;re curating the best of this week.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Restaurant picks (always shown) */}
      {board.restaurants.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Top Restaurant Picks</h3>
            <Link href="/best-of/restaurants" className="text-sm font-medium text-accent hover:underline">
              View all →
            </Link>
          </div>
          <div className="mt-4 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {board.restaurants.slice(0, 4).map((item) => (
              <EventCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
