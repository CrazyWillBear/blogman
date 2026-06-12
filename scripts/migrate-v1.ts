/**
 * Migrate blogman v1 content (md/*.md + blogs/*.json) into the posts table.
 *
 * Usage: npx tsx scripts/migrate-v1.ts [--md-dir md] [--blogs-dir blogs]
 *
 * Idempotent: posts are upserted by slug, so reruns update rather than
 * duplicate. Slugs keep the exact v1 scheme (spaces to dashes, case
 * preserved) so existing live URLs survive the migration.
 */
import { config } from "dotenv";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

config({ path: [".env.local", ".env"] });

export interface ParsedV1Markdown {
  tags: string[];
  pinned: boolean;
  mdContent: string;
}

/**
 * Port of v1 Blog._get_tags: the first line is a tag line iff it matches
 * ^(\{.*?\})+$. The magic "pinned" tag becomes the pinned flag and is
 * dropped from the tag list.
 */
export function parseV1Markdown(raw: string): ParsedV1Markdown {
  const newlineIndex = raw.indexOf("\n");
  const firstLine = (newlineIndex === -1 ? raw : raw.slice(0, newlineIndex)).trim();
  if (!/^(\{.*?\})+$/.test(firstLine)) {
    return { tags: [], pinned: false, mdContent: raw };
  }
  const allTags = [...firstLine.matchAll(/\{(.*?)\}/g)].map((m) => m[1]);
  const mdContent =
    newlineIndex === -1 ? "" : raw.slice(newlineIndex + 1).replace(/^\n/, "");
  return {
    tags: allTags.filter((t) => t !== "pinned"),
    pinned: allTags.includes("pinned"),
    mdContent,
  };
}

/** v1 slug scheme: spaces become dashes, everything else preserved. */
export function v1Slug(title: string): string {
  return title.replace(/ /g, "-");
}

/** Characters that break URL paths; v1 never sanitized these. */
export function slugWarnings(slug: string): string[] {
  const bad = slug.match(/[/?#%]/g);
  return bad ? [...new Set(bad)] : [];
}

interface V1BlogJson {
  title?: string;
  tags?: string[];
  pinned?: boolean;
  date_created?: string;
  date_last_modified?: string;
}

async function migrate() {
  const argv = process.argv.slice(2);
  const argValue = (flag: string, fallback: string) => {
    const i = argv.indexOf(flag);
    return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback;
  };
  const mdDir = argValue("--md-dir", "md");
  const blogsDir = argValue("--blogs-dir", "blogs");

  const { db } = await import("@/db");
  const { posts } = await import("@/db/schema");

  const files = (await readdir(mdDir)).filter((f) => f.endsWith(".md"));
  if (files.length === 0) {
    console.log(`No markdown files found in ${mdDir}/ — nothing to migrate.`);
    return;
  }

  for (const file of files) {
    const title = path.basename(file, ".md");
    const mdPath = path.join(mdDir, file);
    const raw = await readFile(mdPath, "utf8");
    const { tags, pinned, mdContent } = parseV1Markdown(raw);

    let json: V1BlogJson = {};
    try {
      json = JSON.parse(
        await readFile(path.join(blogsDir, `${title}.json`), "utf8"),
      );
    } catch {
      console.warn(`  no ${blogsDir}/${title}.json — falling back to file mtime`);
    }

    const mtime = (await stat(mdPath)).mtime;
    const createdAt = json.date_created ? new Date(json.date_created) : mtime;
    const updatedAt = json.date_last_modified
      ? new Date(json.date_last_modified)
      : mtime;

    const slug = v1Slug(title);
    for (const ch of slugWarnings(slug)) {
      console.warn(
        `  WARNING: slug "${slug}" contains "${ch}" and will not resolve as a URL path`,
      );
    }

    await db
      .insert(posts)
      .values({
        slug,
        title,
        mdContent,
        tags,
        pinned: json.pinned ?? pinned,
        createdAt,
        updatedAt,
      })
      .onConflictDoUpdate({
        target: posts.slug,
        set: { title, mdContent, tags, pinned: json.pinned ?? pinned, createdAt, updatedAt },
      });
    console.log(`  upserted "${title}" -> /${slug} (tags: ${tags.join(", ") || "none"}${pinned || json.pinned ? ", pinned" : ""})`);
  }
  console.log(`Done: ${files.length} post(s) migrated.`);
}

const isMain =
  process.argv[1] && path.resolve(process.argv[1]).includes("migrate-v1");
if (isMain) {
  migrate().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
