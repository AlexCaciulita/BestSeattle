type Props = {
  score: number | null | undefined;
  size?: "sm" | "lg";
};

export default function ScoreBadge({ score, size = "sm" }: Props) {
  if (score == null) return null;

  const dim = size === "lg"
    ? "h-12 w-12 text-base"
    : "h-8 w-8 text-xs";

  return (
    <div
      className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-score-bg font-bold text-score-fg`}
      aria-label={`Score: ${score}`}
    >
      {score.toFixed(1)}
    </div>
  );
}
