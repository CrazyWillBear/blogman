import type { MetadataRoute } from "next";
import { listPosts } from "@/lib/posts";
import { siteUrl } from "@/lib/site";

/** Always reflect the latest posts — no static caching of the sitemap. */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const posts = await listPosts("", "created-desc");

  // Newest post drives the homepage's lastModified; omit it when empty.
  const newest = posts.reduce<Date | undefined>(
    (max, p) => (!max || p.updatedAt > max ? p.updatedAt : max),
    undefined,
  );

  return [
    { url: base, lastModified: newest },
    ...posts.map((post) => ({
      url: `${base}/${post.slug}`,
      lastModified: post.updatedAt,
    })),
  ];
}
