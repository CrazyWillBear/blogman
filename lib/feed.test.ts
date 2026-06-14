import { describe, expect, it } from "vitest";
import type { Post } from "@/db/schema";
import { buildFeed, escapeXml } from "./feed";

/** Minimal Post stand-in — only the fields buildFeed reads need to be real. */
function fakePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 1,
    slug: "first-post",
    title: "First Post",
    mdContent: "# First Post\n\nHello there, this is the body.",
    tags: [],
    pinned: false,
    createdAt: new Date("2024-01-02T03:04:05Z"),
    updatedAt: new Date("2024-01-02T03:04:05Z"),
    search: "",
    ...overrides,
  } as Post;
}

const OPTS = {
  siteUrl: "https://example.com",
  title: "My Blog",
  description: "Things I write.",
  author: "Jane Doe",
};

describe("escapeXml", () => {
  it("escapes all five XML predefined entities", () => {
    expect(escapeXml(`& < > " '`)).toBe("&amp; &lt; &gt; &quot; &apos;");
  });

  it("escapes ampersands before they can form spurious entities", () => {
    expect(escapeXml("a&lt;b")).toBe("a&amp;lt;b");
  });

  it("leaves ordinary text untouched", () => {
    expect(escapeXml("plain text 123")).toBe("plain text 123");
  });
});

describe("buildFeed", () => {
  it("opens with the XML declaration and RSS 2.0 root with the atom namespace", () => {
    const xml = buildFeed([], OPTS);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain(
      '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    );
  });

  it("emits the required channel fields", () => {
    const xml = buildFeed([], OPTS);
    expect(xml).toContain("<title>My Blog</title>");
    expect(xml).toContain("<link>https://example.com</link>");
    expect(xml).toContain("<description>Things I write.</description>");
    expect(xml).toContain("<language>en</language>");
  });

  it("includes a self-referencing atom:link to feed.xml", () => {
    const xml = buildFeed([], OPTS);
    expect(xml).toContain(
      '<atom:link rel="self" type="application/rss+xml" href="https://example.com/feed.xml" />',
    );
  });

  it("renders one item per post with absolute link and permalink guid", () => {
    const xml = buildFeed([fakePost()], OPTS);
    expect(xml).toContain("<link>https://example.com/first-post</link>");
    expect(xml).toContain(
      '<guid isPermaLink="true">https://example.com/first-post</guid>',
    );
  });

  it("formats pubDate as an RFC-822 date", () => {
    const xml = buildFeed([fakePost()], OPTS);
    expect(xml).toContain("<pubDate>Tue, 02 Jan 2024 03:04:05 GMT</pubDate>");
  });

  it("attributes the item to the configured author", () => {
    const xml = buildFeed([fakePost()], OPTS);
    expect(xml).toContain("<author>Jane Doe</author>");
  });

  it("derives the item description from the post excerpt", () => {
    const xml = buildFeed([fakePost()], OPTS);
    expect(xml).toContain(
      "<description>Hello there, this is the body.</description>",
    );
  });

  it("escapes a title containing &, <, >, and quotes — no raw markup leaks", () => {
    const xml = buildFeed([fakePost({ title: `A & B <x> "q"` })], OPTS);
    expect(xml).toContain(
      "<title>A &amp; B &lt;x&gt; &quot;q&quot;</title>",
    );
    // The escaped payload must not introduce stray raw delimiters.
    const titleLine = xml
      .split("\n")
      .find((line) => line.includes("<title>A "));
    expect(titleLine).toBeDefined();
    const inner = titleLine!
      .replace(/^\s*<title>/, "")
      .replace(/<\/title>\s*$/, "");
    expect(inner).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;)/);
    expect(inner).not.toMatch(/[<>]/);
  });

  it("escapes special characters that appear in the slug-derived url", () => {
    const xml = buildFeed([fakePost({ slug: "a&b" })], OPTS);
    expect(xml).toContain("<link>https://example.com/a&amp;b</link>");
  });
});
