export default function Loading() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      <p className="mt-4 text-sm text-muted">Loading...</p>
    </div>
  );
}
