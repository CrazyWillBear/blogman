/**
 * Pure helpers for a post's "kicker" — the small uppercase label above the
 * title (e.g. "Essay № 03"). Kept free of db/react so it can be reused from
 * client and edge contexts (the post page and the OG image both render it).
 */

/** Poem/verse if any tag is "poem"/"poetry" (case-insensitive); else essay. */
export function isVerse(tags: string[]): boolean {
  return tags.some((tag) => /^(poem|poetry)$/i.test(tag.trim()));
}

/** "Poem" for verse posts, "Essay" otherwise. */
export function postKind(tags: string[]): "Poem" | "Essay" {
  return isVerse(tags) ? "Poem" : "Essay";
}

/**
 * The kicker string: the bare kind ("Essay") when there's no number, or the
 * kind with a zero-padded number ("Essay № 03") when one is supplied.
 */
export function formatKicker(tags: string[], number?: number): string {
  const kind = postKind(tags);
  return number === undefined
    ? kind
    : `${kind} № ${String(number).padStart(2, "0")}`;
}
