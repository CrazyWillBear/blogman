import { blogConfig } from "@/blog.config";
import { buildFeed } from "@/lib/feed";
import { listPosts } from "@/lib/posts";
import { siteUrl } from "@/lib/site";

/** Always reflect the latest posts — no static caching of the feed. */
export const dynamic = "force-dynamic";

export async function GET() {
  const posts = (await listPosts("", "created-desc")).slice(0, 10);

  const xml = buildFeed(posts, {
    siteUrl: siteUrl(),
    title: blogConfig.name,
    description: blogConfig.description[0],
    author: blogConfig.author,
  });

  return new Response(xml, {
    headers: { "content-type": "application/rss+xml; charset=utf-8" },
  });
}
