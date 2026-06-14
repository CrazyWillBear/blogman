"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DEFAULT_SORT, type SortOption } from "@/lib/sort";

type SortKey = "created" | "modified";
type SortDir = "asc" | "desc";

/** Split an option string ("created-desc") into its criterion + direction. */
function parseSort(sort: SortOption): { key: SortKey; dir: SortDir } {
  const [key, dir] = sort.split("-") as [SortKey, SortDir];
  return { key, dir };
}

/** Compose a criterion + direction back into a SortOption. */
function composeSort(key: SortKey, dir: SortDir): SortOption {
  return `${key}-${dir}` as SortOption;
}

const segStyle = (active: boolean): React.CSSProperties => ({
  padding: "6px 16px",
  borderRadius: "999px",
  fontFamily: "var(--font-serif), Georgia, serif",
  fontSize: "15px",
  cursor: "pointer",
  border: "none",
  background: active ? "var(--accent)" : "transparent",
  color: active ? "#fbf3e7" : "#8a7b69",
  transition: "all .15s ease",
});

/**
 * Segmented sort pill (№ / Updated) plus a direction toggle. State lives in
 * the `sort` GET param so orderings stay linkable; the `q` param is preserved.
 */
export function SortControl({ sort }: { sort: SortOption }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { key, dir } = parseSort(sort);

  function navigate(next: SortOption) {
    const params = new URLSearchParams(searchParams);
    if (next !== DEFAULT_SORT) params.set("sort", next);
    else params.delete("sort");
    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
  }

  const setKey = (nextKey: SortKey) => navigate(composeSort(nextKey, dir));
  const toggleDir = () =>
    navigate(composeSort(key, dir === "asc" ? "desc" : "asc"));

  const asc = dir === "asc";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
      <div
        style={{
          display: "inline-flex",
          background: "#efdcc2",
          borderRadius: "999px",
          padding: "3px",
        }}
      >
        <button
          type="button"
          aria-pressed={key === "created"}
          onClick={() => setKey("created")}
          style={segStyle(key === "created")}
        >
          №
        </button>
        <button
          type="button"
          aria-pressed={key === "modified"}
          onClick={() => setKey("modified")}
          style={segStyle(key === "modified")}
        >
          Updated
        </button>
      </div>
      <button
        type="button"
        aria-label={asc ? "Sort ascending" : "Sort descending"}
        onClick={toggleDir}
        style={{
          width: "32px",
          height: "32px",
          border: "none",
          borderRadius: "50%",
          cursor: "pointer",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all .15s ease",
          background: asc ? "var(--paper-shade)" : "var(--accent)",
          color: asc ? "var(--accent)" : "#fbf3e7",
        }}
      >
        {asc ? "↑" : "↓"}
      </button>
    </div>
  );
}
