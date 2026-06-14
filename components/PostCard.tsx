import Link from "next/link";
import type { Post } from "@/db/schema";
import { excerpt } from "@/lib/excerpt";
import { PinnedPill, TagPill } from "@/components/Pills";

const monthYear = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});

/** One ruled row in the homepage index: number · title/dek · short date. */
export function PostCard({
  post,
  num,
  stagger,
}: {
  post: Post;
  num: string;
  stagger: number;
}) {
  const dek = excerpt(post.mdContent);

  return (
    <li className="fade-up" style={{ "--stagger": stagger } as React.CSSProperties}>
      <Link
        href={`/${post.slug}`}
        className="group flex items-baseline gap-[18px] py-[18px]"
        style={{ borderTop: "1px solid var(--hairline)", color: "inherit" }}
      >
        <span
          style={{ fontSize: "18px", color: "var(--accent)", flex: "0 0 30px" }}
        >
          {num}
        </span>
        <div className="min-w-0 flex-1">
          <h3
            className="font-semibold underline decoration-transparent decoration-1 underline-offset-4 transition-colors duration-200 group-hover:decoration-ink"
            style={{ fontSize: "22px", lineHeight: 1.15 }}
          >
            {post.title}
          </h3>
          {(post.pinned || post.tags.length > 0) && (
            <div className="flex flex-wrap" style={{ gap: "7px", marginTop: "7px" }}>
              {post.pinned && <PinnedPill />}
              {post.tags.map((tag) => (
                <TagPill key={tag} label={tag} />
              ))}
            </div>
          )}
          {dek && (
            <p
              style={{
                margin: "5px 0 0",
                fontSize: "16px",
                lineHeight: 1.5,
                color: "var(--muted)",
              }}
            >
              {dek}
            </p>
          )}
        </div>
        <time
          dateTime={post.createdAt.toISOString()}
          className="shrink-0"
          style={{ fontSize: "15px", color: "var(--faint)" }}
        >
          {monthYear.format(post.createdAt)}
        </time>
      </Link>
    </li>
  );
}
