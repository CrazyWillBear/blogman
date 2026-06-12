import {
  desc,
  asc,
  eq,
  ilike,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { db } from "@/db";
import { posts, type NewPost, type Post } from "@/db/schema";

import { DEFAULT_SORT, type SortOption } from "./sort";

export { DEFAULT_SORT, isSortOption, SORT_OPTIONS } from "./sort";
export type { SortOption } from "./sort";

/** ORDER BY terms: pinned posts always first, then the chosen criterion. */
export function buildOrderBy(sort: SortOption): SQL[] {
  const column = sort.startsWith("created") ? posts.createdAt : posts.updatedAt;
  const direction = sort.endsWith("desc") ? desc : asc;
  return [desc(posts.pinned), direction(column)];
}

/**
 * Case-insensitive substring match on title, markdown content, or any tag.
 * Returns undefined for a blank query (no WHERE clause).
 */
export function buildSearchFilter(query: string): SQL | undefined {
  const trimmed = query.trim();
  if (!trimmed) return undefined;
  const pattern = `%${trimmed.replace(/[%_\\]/g, "\\$&")}%`;
  return or(
    ilike(posts.title, pattern),
    ilike(posts.mdContent, pattern),
    sql`exists (select 1 from unnest(${posts.tags}) as tag where tag ilike ${pattern})`,
  );
}

export async function listPosts(
  query = "",
  sort: SortOption = DEFAULT_SORT,
): Promise<Post[]> {
  return db
    .select()
    .from(posts)
    .where(buildSearchFilter(query))
    .orderBy(...buildOrderBy(sort));
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const rows = await db.select().from(posts).where(eq(posts.slug, slug));
  return rows[0];
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
