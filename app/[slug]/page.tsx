import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PinMark } from "@/components/PinMark";
import { formatDate } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";
import { getPostBySlug } from "@/lib/posts";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(decodeURIComponent(slug));
  return { title: post?.title ?? "Not found" };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(decodeURIComponent(slug));
  if (!post) notFound();

  const html = await renderMarkdown(post.mdContent);

  return (
    <article className="mx-auto max-w-3xl px-6 pt-12 sm:pt-16">
      <nav className="fade-up" style={{ "--stagger": 0 } as React.CSSProperties}>
        <Link href="/" className="ink-link smallcaps text-lg text-muted">
          ← Home
        </Link>
      </nav>

      <header
        className="fade-up mt-14 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-sm text-faint"
        style={{ "--stagger": 1 } as React.CSSProperties}
      >
        <p>
          {post.pinned && (
            <>
              <PinMark />
              <span aria-hidden className="mx-2">
                ·
              </span>
            </>
          )}
          <time dateTime={post.createdAt.toISOString()}>
            {formatDate(post.createdAt)}
          </time>
          {post.updatedAt.getTime() !== post.createdAt.getTime() && (
            <>
              <span aria-hidden className="mx-2">
                ·
              </span>
              updated{" "}
              <time dateTime={post.updatedAt.toISOString()}>
                {formatDate(post.updatedAt)}
              </time>
            </>
          )}
        </p>
        {post.tags.length > 0 && <p>{post.tags.join(" · ")}</p>}
      </header>

      <div
        className="prose fade-up mt-4 border-t border-hairline pt-10 pb-4"
        style={{ "--stagger": 2 } as React.CSSProperties}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
