"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * The search pill. A search-only client component: it writes the `q` GET param
 * (debounced) so results stay linkable, preserving any existing `sort` param.
 */
export function SearchBox({ query }: { query: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(query);
  const [lastQuery, setLastQuery] = useState(query);
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Resync to the URL when it changes from elsewhere (back/forward) — the
  // render-time adjustment React recommends over a setState-in-effect.
  if (query !== lastQuery) {
    setLastQuery(query);
    setValue(query);
  }

  function navigate(q: string) {
    const params = new URLSearchParams(searchParams);
    if (q) params.set("q", q);
    else params.delete("q");
    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
  }

  function onChange(next: string) {
    setValue(next);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => navigate(next), 200);
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    clearTimeout(debounce.current);
    navigate(value);
  }

  useEffect(() => () => clearTimeout(debounce.current), []);

  return (
    <form action="/" method="get" onSubmit={onSubmit}>
      <input
        type="search"
        name="q"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search the writing…"
        aria-label="Search the writing"
        className="placeholder:text-faint placeholder:opacity-100"
        style={{
          width: "100%",
          appearance: "none",
          WebkitAppearance: "none",
          border: "none",
          background: "var(--paper-shade)",
          borderRadius: "999px",
          padding: "13px 22px",
          fontFamily: "var(--font-serif), Georgia, serif",
          fontSize: "17px",
          color: "var(--ink)",
          outline: "none",
          caretColor: "var(--accent)",
        }}
      />
    </form>
  );
}
