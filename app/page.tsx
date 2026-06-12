import { Suspense } from "react";
import { blogConfig } from "@/blog.config";
import { PostCard } from "@/components/PostCard";
import { SearchControls } from "@/components/SearchControls";
import { DEFAULT_SORT, isSortOption, listPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const query = params.q ?? "";
  const sort =
    params.sort && isSortOption(params.sort) ? params.sort : DEFAULT_SORT;
  const posts = await listPosts(query, sort);

  return (
    <div className="mx-auto max-w-3xl px-6 pt-16 sm:pt-24">
      <header className="fade-up text-center" style={{ "--stagger": 0 } as React.CSSProperties}>
        <p aria-hidden className="smallcaps text-xs text-gold">
          Ex Libris
        </p>
        <h1 className="font-display mt-3 text-5xl font-semibold tracking-tight text-parchment sm:text-6xl">
          {blogConfig.name}
        </h1>
        <div className="mx-auto mt-6 max-w-xl space-y-3 text-parchment-dim">
          {blogConfig.description.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </header>

      <div
        aria-hidden
        className="ornament-divider fade-up my-10"
        style={{ "--stagger": 1 } as React.CSSProperties}
      >
        ❦
      </div>

      <div className="fade-up" style={{ "--stagger": 2 } as React.CSSProperties}>
        <Suspense>
          <SearchControls query={query} sort={sort} />
        </Suspense>
      </div>

      {posts.length === 0 ? (
        <p
          className="fade-up mt-14 text-center italic text-parchment-faint"
          style={{ "--stagger": 3 } as React.CSSProperties}
        >
          Nothing in the archive matches{query ? ` “${query}”` : ""}.
        </p>
      ) : (
        <ul className="mt-10 space-y-4">
          {posts.map((post, index) => (
            <PostCard key={post.slug} post={post} stagger={index + 3} />
          ))}
        </ul>
      )}
    </div>
  );
}
