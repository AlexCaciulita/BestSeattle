"use client";

import { useState } from "react";
import type { CurationItem, CurationStatus } from "@/lib/curation-repo";

type Props = {
  initialItems: CurationItem[];
};

export default function CurationQueueTable({ initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function changeStatus(id: number, status: CurationStatus) {
    try {
      setBusyId(id);
      const res = await fetch(`/api/curation/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const payload = await res.json();
      if (!res.ok || !payload.ok) throw new Error(payload.error || "Update failed");

      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: payload.data.status } : item)),
      );
    } catch (error) {
      console.error(error);
      alert("Could not update status yet. Check Supabase config.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-8 overflow-hidden rounded-xl border border-border bg-surface">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-background">
          <tr>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Source</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-border/60 last:border-b-0">
              <td className="px-4 py-3 capitalize">{item.item_type}</td>
              <td className="px-4 py-3">{item.title}</td>
              <td className="px-4 py-3 text-muted">{item.source ?? "—"}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    item.status === "pending"
                      ? "border border-accent text-accent"
                      : "border border-border text-muted"
                  }`}
                >
                  {item.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    disabled={busyId === item.id}
                    onClick={() => changeStatus(item.id, "approved")}
                    className="rounded-full border border-border px-2 py-1 text-xs hover:border-accent"
                  >
                    Approve
                  </button>
                  <button
                    disabled={busyId === item.id}
                    onClick={() => changeStatus(item.id, "rejected")}
                    className="rounded-full border border-border px-2 py-1 text-xs hover:border-accent"
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
