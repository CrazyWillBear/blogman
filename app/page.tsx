import { Fragment, Suspense } from "react";
import Link from "next/link";
import { blogConfig } from "@/blog.config";
import { PinnedPill, TagPill } from "@/components/Pills";
import { PostCard } from "@/components/PostCard";
import { SearchBox } from "@/components/SearchControls";
import { SortControl } from "@/components/SortControl";
import { excerpt } from "@/lib/excerpt";
import { isVerse } from "@/lib/kicker";
import {
  DEFAULT_SORT,
  getPostNumbers,
  isSortOption,
  listPosts,
  pickFeatured,
} from "@/lib/posts";

export const dynamic = "force-dynamic";

const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

/** Renders a config paragraph, turning [text](url) markdown links into anchors. */
function renderParagraph(text: string) {
  const nodes = [];
  let last = 0;
  for (const match of text.matchAll(LINK)) {
    const [whole, label, href] = match;
    if (match.index > last) nodes.push(text.slice(last, match.index));
    nodes.push(
      <a key={match.index} href={href} className="ink-link">
        {label}
      </a>,
    );
    last = match.index + whole.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes.map((node, i) => <Fragment key={i}>{node}</Fragment>);
}

/** Zero-pad a chronological number to two digits ("3" -> "03"). */
function pad(num: number | undefined): string {
  return num != null ? String(num).padStart(2, "0") : "··";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const query = params.q ?? "";
  const sort =
    params.sort && isSortOption(params.sort) ? params.sort : DEFAULT_SORT;

  const [posts, numbers] = await Promise.all([
    listPosts(query, sort),
    getPostNumbers(),
  ]);

  const trimmed = query.trim();

  // Hero the most-recently-pinned post (independent of browse sort), and drop it
  // from the ruled list so it isn't shown twice. No pinned post → no hero card.
  const featured = trimmed ? undefined : pickFeatured(posts);
  const listed = featured
    ? posts.filter((post) => post.slug !== featured.slug)
    : posts;

  const countLabel = `${listed.length} ${listed.length === 1 ? "piece" : "pieces"}`;

  return (
    <div
      style={{
        maxWidth: "620px",
        margin: "0 auto",
        padding: "72px 32px 96px",
      }}
    >
      <header
        className="fade-up"
        style={{ "--stagger": 0 } as React.CSSProperties}
      >
        <div
          style={{
            width: "40px",
            height: "2px",
            background: "var(--accent)",
            marginBottom: "22px",
          }}
        />
        <h1
          style={{
            margin: 0,
            fontWeight: 600,
            fontSize: "clamp(38px, 9vw, 52px)",
            lineHeight: 1.04,
            letterSpacing: "-.01em",
          }}
        >
          {blogConfig.name}
        </h1>
        <div
          style={{
            marginTop: "18px",
            fontSize: "20px",
            lineHeight: 1.65,
            color: "var(--muted)",
          }}
        >
          {blogConfig.description.map((paragraph, i) => (
            <p key={paragraph} style={{ margin: i === 0 ? 0 : "0.6em 0 0" }}>
              {renderParagraph(paragraph)}
            </p>
          ))}
        </div>
      </header>

      <div
        className="fade-up"
        style={{ marginTop: "32px", "--stagger": 1 } as React.CSSProperties}
      >
        <Suspense>
          <SearchBox query={query} />
        </Suspense>
      </div>

      {featured && (
        <Link
          href={`/${featured.slug}`}
          className="fade-up block"
          style={
            {
              position: "relative",
              background: "var(--paper-shade)",
              borderRadius: "16px",
              padding: "34px 26px 24px",
              margin: "40px 0 6px",
              color: "inherit",
              "--stagger": 2,
            } as React.CSSProperties
          }
        >
          <PinnedPill variant="badge" />
          <h2
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: "27px",
              lineHeight: 1.1,
            }}
          >
            {featured.title}
          </h2>
          {featured.tags.length > 0 && (
            <div
              className="flex flex-wrap"
              style={{ gap: "7px", marginTop: "10px" }}
            >
              {featured.tags.map((tag) => (
                <TagPill key={tag} label={tag} size="md" />
              ))}
            </div>
          )}
          <p
            style={{
              margin: "10px 0 0",
              fontSize: "17px",
              lineHeight: 1.55,
              color: "#6f6155",
            }}
          >
            {excerpt(featured.mdContent)}
          </p>
          <div
            style={{
              marginTop: "13px",
              fontSize: "16px",
              color: "var(--accent)",
            }}
          >
            Read the {isVerse(featured.tags) ? "poem" : "essay"} →
          </div>
        </Link>
      )}

      <div
        className="fade-up"
        style={
          {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "24px 0 2px",
            "--stagger": 3,
          } as React.CSSProperties
        }
      >
        <span
          style={{
            fontSize: "15px",
            color: "var(--faint)",
            fontStyle: "italic",
          }}
        >
          {countLabel}
        </span>
        <Suspense>
          <SortControl sort={sort} />
        </Suspense>
      </div>

      {posts.length === 0 ? (
        <div
          className="fade-up"
          style={
            {
              padding: "40px 0",
              textAlign: "center",
              fontStyle: "italic",
              fontSize: "19px",
              color: "var(--faint)",
              "--stagger": 4,
            } as React.CSSProperties
          }
        >
          Nothing here matches “{query}”. Try another word.
        </div>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {listed.map((post, index) => (
            <PostCard
              key={post.slug}
              post={post}
              num={pad(numbers.get(post.slug))}
              stagger={index + 4}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
