/**
 * Derive a plain-text dek from markdown for previews/meta descriptions.
 *
 * Pure string work — deliberately does NOT touch the remark pipeline so it
 * stays cheap enough for server components. Strips the markup we care about
 * with regexes, collapses whitespace, then truncates on a word boundary.
 */
export function excerpt(md: string, maxLen = 160): string {
  const text = md
    .replace(/^\s*#{1,6}\s+.*(?:\r?\n|$)/, " ") // drop a leading title heading (posts open with "# Title")
    .replace(/```[\s\S]*?```/g, " ") // fenced code blocks
    .replace(/`([^`]*)`/g, "$1") // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links -> link text
    .replace(/<br\s*\/?>/gi, " ") // explicit line breaks
    .replace(/<[^>]+>/g, " ") // remaining html tags
    .replace(/^\s{0,3}#{1,6}\s+/gm, "") // heading markers
    .replace(/^\s{0,3}>\s?/gm, "") // blockquote markers
    .replace(/^\s{0,3}(?:[-*+]|\d+\.)\s+/gm, "") // list markers
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // bold
    .replace(/(\*|_)(.*?)\1/g, "$2") // emphasis
    .replace(/\s+/g, " ") // collapse whitespace/newlines
    .trim();

  if (text.length <= maxLen) return text;

  const truncated = text.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(" ");
  const head = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
  return `${head.trimEnd()}…`;
}
