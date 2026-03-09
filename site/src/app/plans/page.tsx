import Link from "next/link";

const plans = ["date-night", "family-day", "rainy-day"];

export default function PlansPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-4xl font-semibold">Plans</h1>
      <p className="mt-3 text-muted">Ready-made itineraries to act fast.</p>
      <div className="mt-8 grid gap-3 md:grid-cols-2">
        {plans.map((plan) => (
          <Link key={plan} href={`/plans/${plan}`} className="rounded-xl border border-border bg-surface p-4 capitalize hover:border-accent">
            {plan.replaceAll("-", " ")}
          </Link>
        ))}
      </div>
    </div>
  );
}
