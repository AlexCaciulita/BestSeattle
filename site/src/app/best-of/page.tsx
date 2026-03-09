import Link from "next/link";
import Image from "next/image";

const categories = [
  { slug: "restaurants", label: "Restaurants", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80" },
  { slug: "coffee", label: "Coffee", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80" },
  { slug: "date-night", label: "Date Night", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80" },
  { slug: "family", label: "Family", image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80" },
  { slug: "nightlife", label: "Nightlife", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80" },
  { slug: "outdoors", label: "Outdoors", image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80" },
];

export default function BestOfPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-4xl font-semibold">Best Of</h1>
      <p className="mt-3 text-muted">Editorial lists with transparent scoring and manual curation.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/best-of/${c.slug}`}
            className="group relative overflow-hidden rounded-xl border border-border"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={c.image}
                alt={c.label}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="text-xl font-semibold text-white">{c.label}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
