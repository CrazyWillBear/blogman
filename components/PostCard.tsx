import Link from "next/link";
import type { Post } from "@/db/schema";
import { formatDate } from "@/lib/format";
import { WaxSeal } from "./WaxSeal";

/** Catalog-card entry for a post on the homepage index. */
export function PostCard({ post, stagger }: { post: Post; stagger: number }) {
  return (
    <li
      className="fade-up"
      style={{ "--stagger": stagger } as React.CSSProperties}
    >
      <Link
        href={`/${post.slug}`}
        className="group block border border-hairline-faint bg-ink-raised/60 px-6 py-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-hairline hover:bg-ink-raised"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold leading-snug text-parchment group-hover:text-gold-bright transition-colors duration-300">
            {post.title}
          </h2>
          {post.pinned && <WaxSeal />}
        </div>
        {post.tags.length > 0 && (
          <p className="smallcaps mt-1.5 text-xs text-gold">
            {post.tags.join(" · ")}
          </p>
        )}
        <p className="mt-3 text-xs text-parchment-faint">
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
      </Link>
    </li>
  );
}
