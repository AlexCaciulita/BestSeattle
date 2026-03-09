export default function RankingTransparency() {
  return (
    <section className="mt-8 rounded-xl border border-border bg-surface p-5">
      <h3 className="text-lg font-semibold">Why these rankings?</h3>
      <p className="mt-2 text-sm text-muted">
        We rank places using a blended score to keep picks useful and trustworthy.
      </p>
      <ul className="mt-4 grid gap-2 text-sm text-muted md:grid-cols-2">
        <li>• 35% editorial consensus (trusted local guides)</li>
        <li>• 25% source quality weighting</li>
        <li>• 15% recency/freshness</li>
        <li>• 15% social demand signal</li>
        <li>• 10% editor override for local context</li>
      </ul>
    </section>
  );
}
