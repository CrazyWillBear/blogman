/**
 * Pure field formatters for the Open Graph card. Kept free of `next/og` (and
 * thus of satori/wasm) so they stay cheap to unit-test — the rendering module
 * `lib/og.tsx` imports these. Mirrors the pure/render split in `lib/kicker.ts`.
 */

import { formatDate } from "./format";

/**
 * Pick a title font size (px) so even long headlines wrap to a few lines and
 * still fit the 1200×630 card. Bigger for short titles, stepping down by length.
 */
export function ogTitleSize(title: string): number {
  const len = title.length;
  if (len <= 30) return 88;
  if (len <= 48) return 76;
  if (len <= 72) return 64;
  return 54;
}

/** The tag row: the first three tags, middot-joined (extras dropped). */
export function ogTags(tags: string[]): string {
  return tags.slice(0, 3).join(" · ");
}

/**
 * The byline, matching the live post header: "By {author} · {published}", with
 * "· updated {date}" appended only when the post was edited after publishing.
 */
export function ogByline(
  author: string,
  createdAt: Date,
  updatedAt: Date,
): string {
  const base = `By ${author} · ${formatDate(createdAt)}`;
  return updatedAt.getTime() > createdAt.getTime()
    ? `${base} · updated ${formatDate(updatedAt)}`
    : base;
}
