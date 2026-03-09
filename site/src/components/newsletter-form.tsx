"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
        return;
      }
      setStatus("success");
      setMessage("You're in! Watch your inbox.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error. Try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-surface p-6">
      <label className="text-sm font-medium">Email address</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@domain.com"
        required
        className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-4 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-black disabled:opacity-50"
      >
        {status === "loading" ? "Subscribing..." : "Join"}
      </button>
      {message && (
        <p className={`mt-3 text-sm ${status === "success" ? "text-success" : "text-error"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
