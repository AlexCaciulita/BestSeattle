"use client";

type Props = {
  mode: "grid" | "list";
  onChange: (mode: "grid" | "list") => void;
};

export default function ViewToggle({ mode, onChange }: Props) {
  const base = "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors";
  const active = "border-accent bg-accent/10 text-accent";
  const inactive = "border-border text-muted hover:text-foreground";

  return (
    <div className="flex gap-1">
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={`${base} ${mode === "grid" ? active : inactive}`}
        aria-label="Grid view"
        aria-pressed={mode === "grid"}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="1" width="6" height="6" rx="1" />
          <rect x="9" y="1" width="6" height="6" rx="1" />
          <rect x="1" y="9" width="6" height="6" rx="1" />
          <rect x="9" y="9" width="6" height="6" rx="1" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        className={`${base} ${mode === "list" ? active : inactive}`}
        aria-label="List view"
        aria-pressed={mode === "list"}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="1" y1="3" x2="15" y2="3" />
          <line x1="1" y1="8" x2="15" y2="8" />
          <line x1="1" y1="13" x2="15" y2="13" />
        </svg>
      </button>
    </div>
  );
}
