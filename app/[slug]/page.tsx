import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WaxSeal } from "@/components/WaxSeal";
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
    <article className="mx-auto max-w-2xl px-6 pt-12 sm:pt-16">
      <nav className="fade-up" style={{ "--stagger": 0 } as React.CSSProperties}>
        <Link
          href="/"
          className="gold-underline smallcaps text-sm text-parchment-dim"
        >
          ← The Archive
        </Link>
      </nav>

      <header
        className="fade-up mt-10"
        style={{ "--stagger": 1 } as React.CSSProperties}
      >
        <div className="flex items-center gap-3 text-xs text-parchment-faint">
          {post.pinned && <WaxSeal />}
          <p>
            <span className="smallcaps">Penned</span>{" "}
            <time dateTime={post.createdAt.toISOString()}>
              {formatDate(post.createdAt)}
            </time>
            <span aria-hidden className="mx-2 text-gold">
              ·
            </span>
            <span className="smallcaps">Amended</span>{" "}
            <time dateTime={post.updatedAt.toISOString()}>
              {formatDate(post.updatedAt)}
            </time>
          </p>
        </div>
        {post.tags.length > 0 && (
          <p className="smallcaps mt-2 text-xs text-gold">
            {post.tags.join(" · ")}
          </p>
        )}
      </header>

      <div
        aria-hidden
        className="ornament-divider fade-up my-8"
        style={{ "--stagger": 2 } as React.CSSProperties}
      >
        ❦
      </div>

      <div
        className="prose prose-dropcap fade-up pb-4"
        style={{ "--stagger": 3 } as React.CSSProperties}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
