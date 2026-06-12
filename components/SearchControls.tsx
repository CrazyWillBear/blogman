"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { SORT_OPTIONS, type SortOption } from "@/lib/sort";

const SORT_LABELS: Record<SortOption, string> = {
  "created-desc": "Newest first",
  "created-asc": "Oldest first",
  "modified-desc": "Recently updated",
  "modified-asc": "Least recently updated",
};

/** Search box + sort dropdown; state lives in GET params so results are linkable. */
export function SearchControls({
  query,
  sort,
}: {
  query: string;
  sort: SortOption;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

  function navigate(q: string, s: string) {
    const params = new URLSearchParams(searchParams);
    if (q) params.set("q", q);
    else params.delete("q");
    if (s !== "created-desc") params.set("sort", s);
    else params.delete("sort");
    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
  }

  function readForm() {
    const data = new FormData(formRef.current!);
    navigate(String(data.get("q") ?? ""), String(data.get("sort") ?? ""));
  }

  return (
    <form
      ref={formRef}
      action="/"
      method="get"
      onSubmit={(e) => {
        e.preventDefault();
        readForm();
      }}
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      <input
        type="search"
        name="q"
        defaultValue={query}
        placeholder="Search…"
        aria-label="Search posts"
        className="flex-1 border-b border-hairline bg-transparent py-2 placeholder:text-faint focus:border-ink focus:outline-none transition-colors duration-200"
      />
      <select
        name="sort"
        defaultValue={sort}
        aria-label="Sort posts"
        onChange={readForm}
        className="border-b border-hairline bg-transparent py-2 text-muted focus:border-ink focus:outline-none transition-colors duration-200"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {SORT_LABELS[option]}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="smallcaps border-b border-hairline py-2 text-left text-muted transition-colors duration-200 hover:border-ink hover:text-ink sm:px-2"
      >
        Search
      </button>
    </form>
  );
}
