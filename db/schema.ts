import { sql, type SQL } from "drizzle-orm";
import {
  boolean,
  customType,
  index,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    mdContent: text("md_content").notNull(),
    tags: text("tags").array().notNull().default([]),
    pinned: boolean("pinned").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    // Weighted: title (A) > tags (B) > body (C). immutable_array_to_string is
    // a wrapper created in the migration — array_to_string is only STABLE,
    // which Postgres rejects in generated columns.
    search: tsvector("search").generatedAlwaysAs(
      (): SQL =>
        sql`setweight(to_tsvector('english', ${posts.title}), 'A') || setweight(to_tsvector('english', immutable_array_to_string(${posts.tags}, ' ')), 'B') || setweight(to_tsvector('english', ${posts.mdContent}), 'C')`,
    ),
  },
  (table) => [
    index("posts_search_idx").using("gin", table.search),
    index("posts_title_trgm_idx").using(
      "gin",
      sql`${table.title} gin_trgm_ops`,
    ),
  ],
);

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
