import { getItems } from "@/lib/items-repo";
import { fetchAllSeattleAreaEvents } from "@/lib/ticketmaster";
import { classifyTimeWindow, sortByStartTime } from "@/lib/time-utils";
import ListingLayout from "@/components/listing-layout";

export const revalidate = 300;

export const metadata = {
  title: "This Weekend — BestInSeattle",
  description: "The best events happening this weekend in Seattle and the PNW.",
};

type Props = {
  searchParams: Promise<{ category?: string }>;
};

export default async function ThisWeekendPage({ searchParams }: Props) {
  const params = await searchParams;
  const categoryFilter = params.category ?? null;

  const [curated, live] = await Promise.all([
    getItems({ types: ["event"], publicOnly: true, limit: 200 }),
    fetchAllSeattleAreaEvents(50).catch(() => []),
  ]);

  // Merge and dedup
  const seenTitles = new Set(curated.map((i) => i.title.toLowerCase()));
  const all = [
    ...curated,
    ...live.filter((i) => !seenTitles.has(i.title.toLowerCase())),
  ];

  // Filter to events happening tonight through Sunday using real time classification
  const weekendWindows = new Set(["now", "soon", "tonight", "tomorrow", "weekend"]);
  const weekendItems = all.filter((item) => {
    const w = classifyTimeWindow(item.metadata?.starts_at);
    return weekendWindows.has(w);
  });

  // Fall back to timeframe-tagged items if no real dates, then all events
  const fallback = all.filter(
    (item) => item.metadata?.timeframe === "weekend" || item.metadata?.timeframe === "tonight",
  );
  const items = weekendItems.length > 0
    ? sortByStartTime(weekendItems)
    : fallback.length > 0
      ? fallback
      : all;

  return (
    <ListingLayout
      items={items}
      breadcrumbs={[
        { label: "Events", href: "/events" },
        { label: "This Weekend" },
      ]}
      label="Weekend Events"
      filterConfig={{
        showCategoryChips: true,
        showPrice: true,
        showZone: true,
      }}
      searchPlaceholder="Search weekend events..."
      initialCategory={categoryFilter}
    />
  );
}
