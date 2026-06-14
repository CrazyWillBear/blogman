import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogConfig } from "@/blog.config";
import { PinMark } from "@/components/PinMark";
import { excerpt } from "@/lib/excerpt";
import { formatDate } from "@/lib/format";
import { formatKicker, isVerse } from "@/lib/kicker";
import { renderMarkdown } from "@/lib/markdown";
import { getPostBySlug, getPostNumber } from "@/lib/posts";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Drop a leading `# Title` heading when it just repeats the post title — the
 * page already shows the title in its header, and v1 posts open with their
 * title as an H1. Left untouched when the first heading isn't the title.
 */
function stripLeadingTitle(md: string, title: string): string {
  const match = md.match(/^\s*#\s+(.+?)\s*(?:\r?\n|$)/);
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  return match && norm(match[1]) === norm(title)
    ? md.slice(match[0].length)
    : md;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const post = await getPostBySlug(decoded);
  if (!post) return { title: "Not found" };

  const description = excerpt(post.mdContent);
  return {
    title: post.title,
    description,
    alternates: {
      canonical: `/${decoded}`,
      types: { "application/rss+xml": "/feed.xml" },
    },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: `/${decoded}`,
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [blogConfig.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const post = await getPostBySlug(decoded);
  if (!post) notFound();

  const html = await renderMarkdown(stripLeadingTitle(post.mdContent, post.title));
  const number = await getPostNumber(decoded);
  const verse = isVerse(post.tags);
  const kicker = formatKicker(post.tags, number);
  const author = blogConfig.author;

  return (
    <div className="mx-auto max-w-[680px] px-9 pt-10 pb-20">
      <nav className="fade-up" style={{ "--stagger": 0 } as React.CSSProperties}>
        <Link
          href="/"
          className="text-[15px] italic text-muted no-underline"
        >
          ← All writing
        </Link>
      </nav>

      <header
        className="fade-up"
        style={{ "--stagger": 1 } as React.CSSProperties}
      >
        <div
          className="mt-[30px] flex items-baseline justify-between gap-x-6 pt-[11px] text-[11px] uppercase tracking-[0.16em]"
          style={{ borderTop: "1px solid #d8c39a" }}
        >
          <span className="text-kicker">
            {kicker}
            {post.pinned && (
              <>
                {" · "}
                <PinMark />
              </>
            )}
          </span>
          {post.tags.length > 0 && (
            <span className="text-faint">{post.tags.join(" · ")}</span>
          )}
        </div>

        <h1 className="mt-4 mb-0 text-[48px] font-semibold leading-[1.05] tracking-[-0.01em] text-ink">
          {post.title}
        </h1>

        <p className="mt-[13px] mb-0 text-[15px] text-muted">
          By {author}
          <span className="mx-2" aria-hidden>
            ·
          </span>
          <time dateTime={post.createdAt.toISOString()}>
            {formatDate(post.createdAt)}
          </time>
          {post.updatedAt.getTime() !== post.createdAt.getTime() && (
            <span className="text-faint">
              <span className="mx-2" aria-hidden>
                ·
              </span>
              updated{" "}
              <time dateTime={post.updatedAt.toISOString()}>
                {formatDate(post.updatedAt)}
              </time>
            </span>
          )}
        </p>

        <div
          style={{
            height: 2,
            background: "var(--ink)",
            margin: verse ? "20px 0 30px" : "20px 0 26px",
          }}
        />
      </header>

      <div
        className={`prose fade-up${verse ? " verse" : ""}`}
        style={
          {
            "--stagger": 2,
            ...(verse ? {} : { maxWidth: 620 }),
          } as React.CSSProperties
        }
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <footer
        className="fade-up mt-[46px] border-t border-hairline pt-[22px]"
        style={{ "--stagger": 3 } as React.CSSProperties}
      >
        <Link
          href="/"
          className="text-[15px] italic text-muted no-underline"
        >
          ← Back to all writing
        </Link>
      </footer>
    </div>
  );
}
