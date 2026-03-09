import CurationQueueTable from "@/components/curation-queue-table";
import { listCurationItems } from "@/lib/curation-repo";

export default async function AdminQueuePage() {
  const queue = await listCurationItems();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-4xl font-semibold">Curation Queue</h1>
      <p className="mt-3 text-muted">Internal page for manual approval before publishing.</p>
      <CurationQueueTable initialItems={queue} />
    </div>
  );
}
