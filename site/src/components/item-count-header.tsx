type Props = {
  count: number;
  label: string;
};

export default function ItemCountHeader({ count, label }: Props) {
  return (
    <h1 className="text-3xl font-semibold">
      <span className="text-accent">{count}</span>{" "}
      <span className="text-foreground">{label}</span>
    </h1>
  );
}
