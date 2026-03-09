type Props = {
  score?: number | null;
  sponsored?: boolean;
};

export default function QualityBadge({ score, sponsored }: Props) {
  const pills: { label: string; className: string }[] = [];

  if (score != null && score >= 90) {
    pills.push({ label: "Best 100", className: "bg-amber-600 text-white" });
  } else if (score != null && score >= 80) {
    pills.push({ label: "Gem", className: "bg-violet-600 text-white" });
  }

  if (sponsored) {
    pills.push({ label: "Sponsored", className: "border border-accent bg-black/40 text-accent" });
  }

  if (pills.length === 0) return null;

  return (
    <div className="flex gap-1.5">
      {pills.map((pill) => (
        <span
          key={pill.label}
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${pill.className}`}
        >
          {pill.label}
        </span>
      ))}
    </div>
  );
}
