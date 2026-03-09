import NewsletterForm from "@/components/newsletter-form";

export const metadata = {
  title: "Newsletter — BestInSeattle",
  description: "Weekly curated guide to the best events, restaurants, and things to do in Seattle + PNW.",
};

export default function NewsletterPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-4xl font-semibold">Newsletter</h1>
      <p className="mt-3 text-muted">
        One email per week. The best events, restaurants, and things to do — curated, not algorithmic.
        No spam, no fluff.
      </p>
      <div className="mt-8">
        <NewsletterForm />
      </div>
      <div className="mt-8 rounded-xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold">What you get</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted">
          <li>🔥 Top events this weekend</li>
          <li>🍽 Restaurant spotlight with booking links</li>
          <li>🎯 One experience you probably haven&apos;t tried</li>
          <li>📍 Zone deep-dive rotation</li>
        </ul>
      </div>
    </div>
  );
}
