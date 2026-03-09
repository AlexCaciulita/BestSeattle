import { getItems } from "@/lib/items-repo";
import { getZoneBySlug } from "@/lib/zones";
import ListingLayout from "@/components/listing-layout";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const zone = getZoneBySlug(slug);
  return {
    title: `${zone.label} — BestInSeattle`,
    description: `Best events, restaurants, and things to do in ${zone.label}.`,
  };
}

export default async function ZoneDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const zone = getZoneBySlug(slug);

  const items = await getItems({
    publicOnly: true,
    zones: zone.searchTerms,
    limit: 50,
  });

  return (
    <ListingLayout
      items={items}
      breadcrumbs={[
        { label: "Zones", href: "/zones" },
        { label: zone.label },
      ]}
      label={`in ${zone.label}`}
      filterConfig={{
        showType: true,
        showCuisine: true,
        showPrice: true,
      }}
      searchPlaceholder={`Search in ${zone.label}...`}
    />
  );
}
