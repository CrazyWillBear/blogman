import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Post } from "@/db/schema";

vi.mock("@/lib/posts", () => ({ listPosts: vi.fn() }));
vi.mock("@/lib/site", () => ({ siteUrl: () => "https://example.com" }));

import { listPosts } from "@/lib/posts";
import sitemap from "./sitemap";

const mockListPosts = vi.mocked(listPosts);

function post(slug: string, updatedAt: Date): Post {
  return {
    id: 1,
    slug,
    title: slug,
    mdContent: "",
    tags: [],
    pinned: false,
    createdAt: updatedAt,
    updatedAt,
    search: "",
  };
}

describe("sitemap", () => {
  beforeEach(() => mockListPosts.mockReset());

  it("lists the homepage plus one entry per post", async () => {
    mockListPosts.mockResolvedValue([
      post("hello-world", new Date("2026-01-02T00:00:00Z")),
      post("Old-V1-Post", new Date("2026-01-01T00:00:00Z")),
    ]);

    const result = await sitemap();

    expect(result.map((e) => e.url)).toEqual([
      "https://example.com",
      "https://example.com/hello-world",
      "https://example.com/Old-V1-Post",
    ]);
  });

  it("preserves v1 slugs verbatim — no normalization", async () => {
    mockListPosts.mockResolvedValue([post("Title-With-Dashes", new Date())]);

    const result = await sitemap();

    expect(result.some((e) => e.url === "https://example.com/Title-With-Dashes")).toBe(true);
  });

  it("uses each post's updatedAt as lastModified", async () => {
    const updatedAt = new Date("2026-03-04T00:00:00Z");
    mockListPosts.mockResolvedValue([post("a-post", updatedAt)]);

    const result = await sitemap();

    const entry = result.find((e) => e.url === "https://example.com/a-post");
    expect(entry?.lastModified).toEqual(updatedAt);
  });

  it("stamps the homepage with the newest post's updatedAt", async () => {
    const newest = new Date("2026-05-06T00:00:00Z");
    mockListPosts.mockResolvedValue([
      post("newer", newest),
      post("older", new Date("2026-01-01T00:00:00Z")),
    ]);

    const result = await sitemap();

    expect(result[0].url).toBe("https://example.com");
    expect(result[0].lastModified).toEqual(newest);
  });

  it("omits homepage lastModified when there are no posts", async () => {
    mockListPosts.mockResolvedValue([]);

    const result = await sitemap();

    expect(result).toHaveLength(1);
    expect(result[0].url).toBe("https://example.com");
    expect(result[0].lastModified).toBeUndefined();
  });
});
