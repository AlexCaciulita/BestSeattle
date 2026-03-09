type Props = {
  status?: "open" | "closed" | null;
};

export default function StatusBadge({ status }: Props) {
  if (!status) return null;

  const isOpen = status === "open";

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isOpen ? "bg-status-open/15 text-status-open" : "bg-status-closed/15 text-status-closed"
      }`}
    >
      {isOpen ? "Open" : "Closed"}
    </span>
  );
}
