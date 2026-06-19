import { blogConfig } from "@/blog.config";
import { formatKicker } from "@/lib/kicker";
import { ogCard } from "@/lib/og";
import { ogByline, ogTags } from "@/lib/og-fields";
import { getPostBySlug, getPostNumber } from "@/lib/posts";
import { siteHost } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${blogConfig.name} — post`;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const post = await getPostBySlug(decoded);
  const domain = siteHost();

  if (!post) {
    return ogCard({
      variant: "home",
      title: blogConfig.name,
      tagline: blogConfig.description[0],
      domain,
    });
  }

  const number = await getPostNumber(decoded);
  const kicker = formatKicker(post.tags, number);

  return ogCard({
    variant: "post",
    kicker,
    title: post.title,
    tags: ogTags(post.tags),
    byline: ogByline(blogConfig.author, post.createdAt, post.updatedAt),
    domain,
  });
}
