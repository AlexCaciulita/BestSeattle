"use client";

import { useState } from "react";

type Props = {
  placeholder?: string;
  onSearch: (query: string) => void;
};

export default function SearchBar({ placeholder = "Search...", onSearch }: Props) {
  const [query, setQuery] = useState("");

  return (
    <div className="relative w-full">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="7" cy="7" r="5" />
        <line x1="11" y1="11" x2="14.5" y2="14.5" />
      </svg>
      <input
        type="search"
        role="search"
        aria-label="Search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onSearch(e.target.value);
        }}
        placeholder={placeholder}
        className="w-full rounded-full border border-border bg-surface py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
      />
    </div>
  );
}
