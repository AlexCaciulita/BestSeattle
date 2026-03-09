import Link from "next/link";

export const metadata = {
  title: "About — BestInSeattle",
  description: "How BestInSeattle curates the best events, restaurants, and experiences in Seattle and the PNW.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-semibold">About BestInSeattle</h1>

      <div className="mt-8 space-y-6 text-muted leading-relaxed">
        <p>
          BestInSeattle is a premium editorial guide to events, restaurants, and local experiences
          across Seattle, Bellevue, Kirkland, Redmond, and the greater PNW.
        </p>

        <p>
          We believe discovery should be fast, trustworthy, and taste-driven — not buried under ads
          and SEO spam. Every pick on this platform is curated through a blend of editorial judgment,
          source quality scoring, and community signal.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">How we curate</h2>
        <ul className="space-y-2">
          <li>• <strong>Editorial consensus</strong> — we cross-reference trusted local sources</li>
          <li>• <strong>Source quality scoring</strong> — official venues and known publications rank higher</li>
          <li>• <strong>Freshness tracking</strong> — stale data gets flagged and refreshed</li>
          <li>• <strong>Transparency</strong> — every pick shows its source and scoring rationale</li>
        </ul>

        <h2 className="text-2xl font-semibold text-foreground">Sponsored content</h2>
        <p>
          We accept paid placements. They are always labeled <strong>&quot;Sponsored&quot;</strong> and
          go through the same editorial review. Paying doesn&apos;t buy a higher score — it buys visibility.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Coverage area</h2>
        <p>
          Seattle core neighborhoods, Capitol Hill, Ballard, Fremont, Queen Anne, West Seattle,
          plus the Eastside — Bellevue, Kirkland, Redmond, and surrounding communities.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/newsletter" className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-black">
            Join the Newsletter
          </Link>
          <Link href="/tonight" className="rounded-full border border-border px-6 py-3 text-sm font-semibold">
            See Tonight&apos;s Picks
          </Link>
        </div>
      </div>
    </div>
  );
}
