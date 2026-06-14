import { and, asc, desc, eq, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { posts, type NewPost, type Post } from "@/db/schema";

import { DEFAULT_SORT, type SortOption } from "./sort";

export { DEFAULT_SORT, isSortOption, SORT_OPTIONS } from "./sort";
export type { SortOption } from "./sort";

/** ORDER BY terms for browsing: pinned posts first, then the chosen criterion. */
export function buildOrderBy(sort: SortOption): SQL[] {
  const column = sort.startsWith("created") ? posts.createdAt : posts.updatedAt;
  const direction = sort.endsWith("desc") ? desc : asc;
  return [desc(posts.pinned), direction(column)];
}

/**
 * Full-text match against the weighted search vector (title > tags > body).
 * websearch_to_tsquery gives stemming, multi-word AND, quoted phrases, and
 * `-exclusions`, and treats the input as plain text (safe to bind raw).
 * Returns undefined for a blank query (no WHERE clause).
 */
export function buildSearchFilter(query: string): SQL | undefined {
  const trimmed = query.trim();
  if (!trimmed) return undefined;
  return sql`${posts.search} @@ websearch_to_tsquery('english', ${trimmed})`;
}

/** Relevance rank first when searching; browse ordering otherwise. */
export function buildSearchOrderBy(query: string, sort: SortOption): SQL[] {
  const trimmed = query.trim();
  if (!trimmed) return buildOrderBy(sort);
  return [
    sql`ts_rank(${posts.search}, websearch_to_tsquery('english', ${trimmed})) desc`,
    ...buildOrderBy(sort).slice(1),
  ];
}

/**
 * Trigram fallback for queries full-text search can't match (typos, partial
 * words). word_similarity scores the query against the best-matching word in
 * the title or tag — plain similarity() compares whole strings, so one typo'd
 * word against a multi-word title dilutes below any usable threshold.
 */
export function buildFuzzyFilter(query: string): SQL | undefined {
  const trimmed = query.trim();
  if (!trimmed) return undefined;
  return or(
    sql`word_similarity(${trimmed}, ${posts.title}) > 0.3`,
    sql`exists (select 1 from unnest(${posts.tags}) as tag where word_similarity(${trimmed}, tag) > 0.3)`,
  );
}

/** Best title match first for fuzzy results. */
export function buildFuzzyOrderBy(query: string): SQL[] {
  return [sql`word_similarity(${query.trim()}, ${posts.title}) desc`];
}

/**
 * The homepage hero: the most-recently-created pinned post (id descending as a
 * deterministic tie-break). Returns undefined when nothing is pinned — in which
 * case the homepage shows no featured card.
 */
export function pickFeatured(candidates: Post[]): Post | undefined {
  return candidates
    .filter((post) => post.pinned)
    .reduce<Post | undefined>(
      (best, post) =>
        !best ||
        post.createdAt > best.createdAt ||
        (post.createdAt.getTime() === best.createdAt.getTime() &&
          post.id > best.id)
          ? post
          : best,
      undefined,
    );
}

export async function listPosts(
  query = "",
  sort: SortOption = DEFAULT_SORT,
): Promise<Post[]> {
  const results = await db
    .select()
    .from(posts)
    .where(buildSearchFilter(query))
    .orderBy(...buildSearchOrderBy(query, sort));
  if (results.length > 0 || !query.trim()) return results;
  // Nothing matched full-text — likely a typo or partial word; retry fuzzy.
  return db
    .select()
    .from(posts)
    .where(buildFuzzyFilter(query))
    .orderBy(...buildFuzzyOrderBy(query));
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const rows = await db.select().from(posts).where(eq(posts.slug, slug));
  return rows[0];
}

/**
 * Stable chronological post numbers, oldest = 1. Maps each slug to its rank by
 * created_at ascending (id ascending as a deterministic tie-break), so the
 * author's first-ever post is №1 regardless of the browse sort.
 */
export async function getPostNumbers(): Promise<Map<string, number>> {
  const rows = await db
    .select({ slug: posts.slug })
    .from(posts)
    .orderBy(asc(posts.createdAt), asc(posts.id));
  return new Map(rows.map((row, index) => [row.slug, index + 1]));
}

/**
 * Chronological number for a single slug: one more than the count of posts that
 * precede it (older created_at, or equal created_at with a smaller id). Returns
 * undefined when the slug doesn't exist.
 */
export async function getPostNumber(slug: string): Promise<number | undefined> {
  const post = await getPostBySlug(slug);
  if (!post) return undefined;
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(posts)
    .where(
      or(
        sql`${posts.createdAt} < ${post.createdAt}`,
        and(eq(posts.createdAt, post.createdAt), sql`${posts.id} < ${post.id}`),
      ),
    );
  return rows[0].count + 1;
}

/** New posts get lowercase-kebab slugs; migrated v1 slugs are preserved as-is. */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createPost(
  post: Omit<NewPost, "id" | "slug" | "createdAt" | "updatedAt">,
): Promise<Post> {
  const rows = await db
    .insert(posts)
    .values({ ...post, slug: slugify(post.title) })
    .returning();
  return rows[0];
}

export async function updatePost(
  slug: string,
  changes: Partial<Pick<Post, "title" | "mdContent" | "tags" | "pinned">>,
): Promise<Post | undefined> {
  const rows = await db
    .update(posts)
    .set({ ...changes, updatedAt: new Date() })
    .where(eq(posts.slug, slug))
    .returning();
  return rows[0];
}

export async function deletePost(slug: string): Promise<void> {
  await db.delete(posts).where(eq(posts.slug, slug));
}
