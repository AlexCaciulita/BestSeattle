import Link from "next/link";

export const metadata = {
  title: "Sponsored Content Policy — BestInSeattle",
  description: "How BestInSeattle handles sponsored and paid content placements.",
};

export default function SponsoredPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-semibold">Sponsored Content Policy</h1>

      <div className="mt-8 space-y-6 text-muted leading-relaxed">
        <p>
          BestInSeattle accepts paid placements from local businesses and event organizers.
          Here&apos;s how we handle them:
        </p>

        <h2 className="text-xl font-semibold text-foreground">Clear labeling</h2>
        <p>
          Every paid placement is explicitly labeled <strong>&quot;Sponsored&quot;</strong> with a visible badge.
          There are no hidden ads, no pay-for-ranking schemes, and no unmarked promotions.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Editorial standards apply</h2>
        <p>
          Sponsored listings go through the same curation review as organic picks. We reserve the right
          to decline any placement that doesn&apos;t meet our quality bar.
        </p>

        <h2 className="text-xl font-semibold text-foreground">What sponsors get</h2>
        <ul className="space-y-2">
          <li>• Featured card placement on relevant pages</li>
          <li>• Inclusion in the weekly newsletter (labeled)</li>
          <li>• Priority booking link placement</li>
          <li>• Click and impression reporting</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground">Interested?</h2>
        <p>
          If you run a venue, restaurant, or event in the Seattle/Eastside area and want to reach
          our audience, reach out. We&apos;re building something premium and selective.
        </p>

        <div className="mt-6">
          <Link href="/newsletter" className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-black">
            See the Newsletter
          </Link>
        </div>
      </div>
    </div>
  );
}
