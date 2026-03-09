import Link from "next/link";

export type BreadcrumbSegment = {
  label: string;
  href?: string;
};

type Props = {
  segments: BreadcrumbSegment[];
};

export default function Breadcrumbs({ segments }: Props) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
        </li>
        {segments.map((seg, i) => {
          const isLast = i === segments.length - 1;
          return (
            <li key={seg.label} className="flex items-center gap-1.5">
              <span className="text-border">&gt;</span>
              {isLast || !seg.href ? (
                <span aria-current={isLast ? "page" : undefined} className={isLast ? "text-foreground" : ""}>
                  {seg.label}
                </span>
              ) : (
                <Link href={seg.href} className="hover:text-foreground">
                  {seg.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
