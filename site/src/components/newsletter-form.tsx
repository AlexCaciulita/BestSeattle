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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex overflow-hidden rounded-full border border-[#2a2a2a] bg-[#111] focus-within:border-[#d4af37]/50 transition-colors">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 bg-transparent px-5 py-3.5 text-[13px] text-[#f0f0f0] placeholder:text-[#444] outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 rounded-full bg-[#d4af37] px-6 py-3.5 text-[12px] font-bold uppercase tracking-wider text-black transition-opacity hover:opacity-90 disabled:opacity-50 m-0.5"
        >
          {status === "loading" ? "..." : "Join"}
        </button>
      </div>
      {message && (
        <p className={`text-[12px] ${status === "success" ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
