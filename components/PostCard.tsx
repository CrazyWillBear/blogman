import Link from "next/link";
import type { Post } from "@/db/schema";
import { formatDate } from "@/lib/format";
import { PinMark } from "./PinMark";

/** One ruled row in the homepage post index. */
export function PostCard({ post, stagger }: { post: Post; stagger: number }) {
  return (
    <li
      className="fade-up"
      style={{ "--stagger": stagger } as React.CSSProperties}
    >
      <Link
        href={`/${post.slug}`}
        className="group flex items-baseline justify-between gap-6 py-5"
      >
        <div className="min-w-0">
          <h2 className="text-2xl font-bold leading-snug underline decoration-transparent decoration-1 underline-offset-4 transition-colors duration-200 group-hover:decoration-ink">
            {post.title}
            {post.pinned && (
              <>
                {" "}
                <PinMark />
              </>
            )}
          </h2>
          {post.tags.length > 0 && (
            <p className="mt-1 text-sm text-faint">
              {post.tags.join(" · ")}
            </p>
          )}
        </div>
        <time
          dateTime={post.createdAt.toISOString()}
          className="shrink-0 text-sm text-faint"
        >
          {formatDate(post.createdAt)}
        </time>
      </Link>
    </li>
  );
}
