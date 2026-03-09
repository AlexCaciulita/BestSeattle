import Link from "next/link";
import Image from "next/image";
import { zones } from "@/lib/zones";

export default function ZonesPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-4xl font-semibold">Zones</h1>
      <p className="mt-3 text-muted">Neighborhood-first discovery across Seattle and the PNW.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {zones.map((z) => (
          <Link
            key={z.slug}
            href={`/zones/${z.slug}`}
            className="group relative overflow-hidden rounded-xl border border-border"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={z.image}
                alt={z.label}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="text-lg font-semibold text-white">{z.label}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
