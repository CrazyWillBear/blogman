import { blogConfig } from "@/blog.config";
import { formatKicker } from "@/lib/kicker";
import { ogCard } from "@/lib/og";
import { getPostBySlug, getPostNumber } from "@/lib/posts";

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

  if (!post) {
    return ogCard({ title: blogConfig.name, siteName: blogConfig.name });
  }

  const number = await getPostNumber(decoded);
  const kicker = formatKicker(post.tags, number);

  return ogCard({
    kicker,
    title: post.title,
    siteName: blogConfig.name,
  });
}
