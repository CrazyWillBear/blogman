/** Sort options shared by server queries and client controls (no db imports). */
export const SORT_OPTIONS = [
  "created-desc",
  "created-asc",
  "modified-desc",
  "modified-asc",
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];

export const DEFAULT_SORT: SortOption = "created-desc";

export function isSortOption(value: string): value is SortOption {
  return (SORT_OPTIONS as readonly string[]).includes(value);
}
