import ListingLayout from "@/components/listing-layout";
import RankingTransparency from "@/components/ranking-transparency";
import { getItems } from "@/lib/items-repo";

const categoryMap: Record<string, { types: ("event" | "restaurant" | "place")[]; categories: string[]; label: string }> = {
  restaurants: { types: ["restaurant"], categories: [], label: "Restaurants" },
  coffee: { types: ["restaurant", "place"], categories: ["coffee", "cafe"], label: "Coffee" },
  "date-night": { types: ["restaurant", "event"], categories: ["Italian", "Japanese", "French", "Theater", "Music", "cocktail"], label: "Date Night" },
  family: { types: ["event", "place"], categories: ["family", "kids"], label: "Family" },
  nightlife: { types: ["event", "restaurant"], categories: ["nightlife", "bar", "music", "club", "cocktail"], label: "Nightlife" },
  outdoors: { types: ["place", "event"], categories: ["outdoor", "hike", "park", "play"], label: "Outdoors" },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = categoryMap[slug];
  const label = config?.label ?? slug.replaceAll("-", " ");
  return {
    title: `Best ${label} — BestInSeattle`,
    description: `The best ${label.toLowerCase()} in Seattle and the Eastside, editorially curated.`,
  };
}

export default async function BestOfCategory({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = categoryMap[slug] ?? { types: ["event", "restaurant", "place"], categories: [slug], label: slug.replaceAll("-", " ") };

  const items = await getItems({
    types: config.types,
    categories: config.categories.length > 0 ? config.categories : undefined,
    publicOnly: true,
    limit: 50,
  });

  return (
    <>
      <ListingLayout
        items={items}
        breadcrumbs={[
          { label: "Best Of", href: "/best-of" },
          { label: config.label },
        ]}
        label={config.label}
        filterConfig={{
          showCuisine: true,
          cuisineLabel: "Cuisine",
          showPrice: true,
          showRating: true,
          showZone: true,
        }}
        searchPlaceholder={`Search ${config.label.toLowerCase()}...`}
      />
      <div className="mx-auto max-w-6xl px-6 pb-8">
        <RankingTransparency />
      </div>
    </>
  );
}
