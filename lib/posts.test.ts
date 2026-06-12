import { describe, expect, it } from "vitest";

process.env.DATABASE_URL ??= "postgres://test:test@localhost/test";

const {
  buildOrderBy,
  buildSearchFilter,
  isSortOption,
  slugify,
  DEFAULT_SORT,
} = await import("./posts");
const { db } = await import("@/db");
const { posts } = await import("@/db/schema");

function renderListQuery(query: string, sort: Parameters<typeof buildOrderBy>[0]) {
  return db
    .select()
    .from(posts)
    .where(buildSearchFilter(query))
    .orderBy(...buildOrderBy(sort))
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

  it("matches title, content, and tags case-insensitively", () => {
    const { sql, params } = renderListQuery("forest", DEFAULT_SORT);
    expect(sql).toContain('"posts"."title" ilike');
    expect(sql).toContain('"posts"."md_content" ilike');
    expect(sql).toContain("unnest");
    expect(params).toContain("%forest%");
  });

  it("escapes SQL LIKE wildcards in the query", () => {
    const { params } = renderListQuery("100%_done", DEFAULT_SORT);
    expect(params).toContain("%100\\%\\_done%");
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

describe("slugify", () => {
  it("lowercases and kebab-cases titles", () => {
    expect(slugify("Leaving The Forest")).toBe("leaving-the-forest");
    expect(slugify("Hello, World!")).toBe("hello-world");
    expect(slugify("  spaced  out  ")).toBe("spaced-out");
  });
});
