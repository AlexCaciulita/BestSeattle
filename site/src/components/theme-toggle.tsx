"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

type ThemeName = "light" | "blackgold";

function getSnapshot(): ThemeName {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem("bis_theme") as ThemeName) ?? "light";
}

function getServerSnapshot(): ThemeName {
  return "light";
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next: ThemeName = theme === "light" ? "blackgold" : "light";
    localStorage.setItem("bis_theme", next);
    document.documentElement.setAttribute("data-theme", next);
    // Trigger storage event for useSyncExternalStore
    window.dispatchEvent(new StorageEvent("storage", { key: "bis_theme", newValue: next }));
  }, [theme]);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-full border border-border px-3 py-1 text-xs text-muted hover:text-foreground"
    >
      {theme === "light" ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
