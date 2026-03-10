"use client";

import { useState, useEffect } from "react";

export default function StickyNewsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if already dismissed this session
    if (sessionStorage.getItem("newsletter-dismissed")) {
      setDismissed(true);
      return;
    }

    // Show after scrolling past first section
    function onScroll() {
      if (window.scrollY > 400) {
        setVisible(true);
        window.removeEventListener("scroll", onScroll);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      setMessage("You're in!");
      setEmail("");
      setTimeout(() => {
        setDismissed(true);
        sessionStorage.setItem("newsletter-dismissed", "1");
      }, 2000);
    } catch {
      setStatus("error");
      setMessage("Network error.");
    }
  }

  function dismiss() {
    setDismissed(true);
    sessionStorage.setItem("newsletter-dismissed", "1");
  }

  if (dismissed || !visible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-30 mx-auto max-w-md md:bottom-6 md:left-auto md:right-6">
      <div className="flex items-center gap-2 rounded-full border border-[#2a2a2a] bg-[#111]/95 px-3 py-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
        {status === "success" ? (
          <p className="flex-1 px-2 text-[12px] font-medium text-[#22c55e]">
            {message}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5" className="shrink-0 ml-1">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Weekly picks — your email"
              required
              className="min-w-0 flex-1 bg-transparent text-[12px] text-[#ccc] placeholder:text-[#555] outline-none"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="shrink-0 rounded-full bg-[#d4af37] px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-black transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {status === "loading" ? "..." : "Join"}
            </button>
          </form>
        )}
        <button
          onClick={dismiss}
          className="shrink-0 p-1 text-[#555] transition-colors hover:text-[#888]"
          aria-label="Dismiss newsletter"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      {status === "error" && message && (
        <p className="mt-1 text-center text-[10px] text-[#ef4444]">{message}</p>
      )}
    </div>
  );
}
