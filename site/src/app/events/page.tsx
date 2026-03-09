import { getItems } from "@/lib/items-repo";
import { fetchAllSeattleAreaEvents } from "@/lib/ticketmaster";
import ListingLayout from "@/components/listing-layout";

export const metadata = {
  title: "Events — BestInSeattle",
  description: "Curated events for Seattle, Bellevue, Kirkland, Redmond and the PNW.",
};

type Props = {
  searchParams: Promise<{ category?: string }>;
};

export default async function EventsPage({ searchParams }: Props) {
  const params = await searchParams;
  const categoryFilter = params.category ?? null;

  // Fetch from both Supabase/seed and Ticketmaster live API
  const [curated, live] = await Promise.all([
    getItems({ types: ["event"], publicOnly: true, limit: 200 }),
    fetchAllSeattleAreaEvents(50).catch(() => []),
  ]);

  // Merge: curated first, then live (dedup by title)
  const seenTitles = new Set(curated.map((i) => i.title.toLowerCase()));
  const merged = [
    ...curated,
    ...live.filter((i) => !seenTitles.has(i.title.toLowerCase())),
  ];

  return (
    <ListingLayout
      items={merged}
      breadcrumbs={[{ label: "Events" }]}
      label="Events"
      filterConfig={{
        showCategoryChips: true,
        showPrice: true,
        showZone: true,
      }}
      searchPlaceholder="Search events..."
      initialCategory={categoryFilter}
    />
  );
}
