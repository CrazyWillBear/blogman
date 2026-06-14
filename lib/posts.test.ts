import { describe, expect, it } from "vitest";

process.env.DATABASE_URL ??= "postgres://test:test@localhost/test";

const {
  buildSearchFilter,
  buildSearchOrderBy,
  buildFuzzyFilter,
  buildFuzzyOrderBy,
  isSortOption,
  pickFeatured,
  slugify,
  DEFAULT_SORT,
} = await import("./posts");
const { db } = await import("@/db");
const { posts } = await import("@/db/schema");

type Post = import("@/db/schema").Post;

/** Minimal Post for pickFeatured, which only reads id/pinned/createdAt. */
function makePost(over: Partial<Post>): Post {
  return {
    id: 1,
    slug: "s",
    title: "t",
    mdContent: "",
    tags: [],
    pinned: false,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    search: "",
    ...over,
  } as Post;
}

function renderListQuery(
  query: string,
  sort: Parameters<typeof buildSearchOrderBy>[1],
) {
  return db
    .select()
    .from(posts)
    .where(buildSearchFilter(query))
    .orderBy(...buildSearchOrderBy(query, sort))
    .toSQL();
}

describe("buildOrderBy", () => {
  it("always sorts pinned posts first", () => {
    for (const sort of ["created-desc", "created-asc", "modified-desc", "modified-asc"] as const) {
      const { sql } = renderListQuery("", sort);
      expect(sql).toMatch(/order by "posts"\."pinned" desc/);
    }
  });

  it("sorts by created_at descending by default", () => {
    const { sql } = renderListQuery("", DEFAULT_SORT);
    expect(sql).toMatch(/"pinned" desc, "posts"\."created_at" desc$/);
  });

  it("sorts by created_at ascending", () => {
    const { sql } = renderListQuery("", "created-asc");
    expect(sql).toMatch(/"created_at" asc$/);
  });

  it("sorts by updated_at for modified options", () => {
    expect(renderListQuery("", "modified-desc").sql).toMatch(/"updated_at" desc$/);
    expect(renderListQuery("", "modified-asc").sql).toMatch(/"updated_at" asc$/);
  });
});

describe("buildSearchFilter", () => {
  it("returns undefined for blank queries", () => {
    expect(buildSearchFilter("")).toBeUndefined();
    expect(buildSearchFilter("   ")).toBeUndefined();
    expect(renderListQuery("", DEFAULT_SORT).sql).not.toContain("where");
  });

  it("matches the search vector with websearch_to_tsquery", () => {
    const { sql, params } = renderListQuery("forest walks", DEFAULT_SORT);
    expect(sql).toContain('"posts"."search" @@ websearch_to_tsquery');
    expect(params).toContain("forest walks");
  });

  it("passes the query as a bound parameter, not interpolated SQL", () => {
    const hostile = "'; drop table posts; --";
    const { sql, params } = renderListQuery(hostile, DEFAULT_SORT);
    expect(sql).not.toContain("drop table");
    expect(params).toContain(hostile);
  });
});

describe("buildSearchOrderBy", () => {
  it("orders by relevance rank first when a query is present", () => {
    const { sql } = renderListQuery("forest", DEFAULT_SORT);
    expect(sql).toMatch(/order by ts_rank\("posts"\."search", websearch_to_tsquery/);
    expect(sql).toMatch(/"posts"\."created_at" desc$/);
  });

  it("falls back to browse ordering (pinned first) for blank queries", () => {
    const { sql } = renderListQuery("", DEFAULT_SORT);
    expect(sql).toMatch(/order by "posts"\."pinned" desc, "posts"\."created_at" desc$/);
  });
});

describe("buildFuzzyFilter", () => {
  it("returns undefined for blank queries", () => {
    expect(buildFuzzyFilter("")).toBeUndefined();
    expect(buildFuzzyFilter("   ")).toBeUndefined();
  });

  it("uses trigram word similarity on title and tags", () => {
    const rendered = db
      .select()
      .from(posts)
      .where(buildFuzzyFilter("postgers"))
      .orderBy(...buildFuzzyOrderBy("postgers"))
      .toSQL();
    expect(rendered.sql).toMatch(/word_similarity\(\$\d+, "posts"\."title"\)/);
    expect(rendered.sql).toContain("unnest");
    expect(rendered.sql).toMatch(/order by word_similarity\(\$\d+, "posts"\."title"\) desc/);
    expect(rendered.params).toContain("postgers");
  });
});

describe("isSortOption", () => {
  it("accepts known options and rejects junk", () => {
    expect(isSortOption("created-desc")).toBe(true);
    expect(isSortOption("modified-asc")).toBe(true);
    expect(isSortOption("newest")).toBe(false);
    expect(isSortOption("")).toBe(false);
  });
});

describe("pickFeatured", () => {
  it("returns undefined when nothing is pinned", () => {
    expect(pickFeatured([makePost({}), makePost({ id: 2 })])).toBeUndefined();
  });

  it("ignores unpinned posts even when newer", () => {
    const pinned = makePost({
      id: 1,
      slug: "pinned",
      pinned: true,
      createdAt: new Date("2025-01-01"),
    });
    const newerUnpinned = makePost({
      id: 2,
      slug: "newer",
      createdAt: new Date("2025-06-01"),
    });
    expect(pickFeatured([newerUnpinned, pinned])?.slug).toBe("pinned");
  });

  it("picks the most-recently-created pinned post", () => {
    const older = makePost({
      id: 1,
      slug: "older",
      pinned: true,
      createdAt: new Date("2025-01-01"),
    });
    const newer = makePost({
      id: 2,
      slug: "newer",
      pinned: true,
      createdAt: new Date("2025-03-01"),
    });
    expect(pickFeatured([older, newer])?.slug).toBe("newer");
  });

  it("breaks createdAt ties by larger id", () => {
    const at = new Date("2025-02-02");
    const a = makePost({ id: 5, slug: "a", pinned: true, createdAt: at });
    const b = makePost({ id: 9, slug: "b", pinned: true, createdAt: at });
    expect(pickFeatured([a, b])?.slug).toBe("b");
  });
});

describe("slugify", () => {
  it("lowercases and kebab-cases titles", () => {
    expect(slugify("Leaving The Forest")).toBe("leaving-the-forest");
    expect(slugify("Hello, World!")).toBe("hello-world");
    expect(slugify("  spaced  out  ")).toBe("spaced-out");
  });
});
