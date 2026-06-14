import type { Post } from "@/db/schema";

import { excerpt } from "./excerpt";

/**
 * Escape the five XML predefined entities. This is the well-formedness and
 * XSS surface for the feed — any post-controlled text (titles, descriptions)
 * must pass through here before being interpolated into the XML.
 */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export interface FeedOptions {
  siteUrl: string;
  title: string;
  description: string;
  author: string;
}

/**
 * Build a valid RSS 2.0 feed from posts. Pure: no db access, no fetch — pass
 * in the posts and channel identity, get back an XML string.
 */
export function buildFeed(posts: Post[], opts: FeedOptions): string {
  const { siteUrl, title, description, author } = opts;

  const items = posts
    .map((post) => {
      const url = `${siteUrl}/${post.slug}`;
      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <pubDate>${post.createdAt.toUTCString()}</pubDate>`,
        `      <author>${escapeXml(author)}</author>`,
        `      <description>${escapeXml(excerpt(post.mdContent))}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(description)}</description>
    <language>en</language>
    <atom:link rel="self" type="application/rss+xml" href="${escapeXml(`${siteUrl}/feed.xml`)}" />
${items}
  </channel>
</rss>
`;
}
