import Link from "next/link";

const plans = [
  {
    slug: "date-night",
    title: "Date Night",
    blurb: "Dinner + event + late-night stop, optimized by zone.",
  },
  {
    slug: "family-day",
    title: "Family Day",
    blurb: "Kid-friendly picks, low friction, all weather safe.",
  },
  {
    slug: "rainy-day",
    title: "Rainy Day",
    blurb: "Indoor-first itinerary when Seattle does Seattle.",
  },
];

export default function PlanBuilder() {
  return (
    <section className="mt-10 rounded-2xl border border-border bg-surface p-8">
      <h2 className="text-2xl font-semibold">Plan Builder</h2>
      <p className="mt-2 text-muted">Skip the decision fatigue. Pick a mode and go.</p>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {plans.map((plan) => (
          <Link
            key={plan.slug}
            href={`/plans/${plan.slug}`}
            className="rounded-xl border border-border p-5 hover:border-accent"
          >
            <h3 className="text-lg font-semibold">{plan.title}</h3>
            <p className="mt-2 text-sm text-muted">{plan.blurb}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
