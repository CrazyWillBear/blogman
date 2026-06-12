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
      <header
        className="fade-up"
        style={{ "--stagger": 0 } as React.CSSProperties}
      >
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {blogConfig.name}
        </h1>
        <div className="mt-5 max-w-2xl space-y-3 text-lg text-muted">
          {blogConfig.description.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </header>

      <div
        className="fade-up mt-12"
        style={{ "--stagger": 1 } as React.CSSProperties}
      >
        <Suspense>
          <SearchControls query={query} sort={sort} />
        </Suspense>
      </div>

      {posts.length === 0 ? (
        <p
          className="fade-up mt-14 italic text-faint"
          style={{ "--stagger": 2 } as React.CSSProperties}
        >
          Nothing here matches{query ? ` “${query}”` : ""}.
        </p>
      ) : (
        <ul className="mt-10 divide-y divide-hairline border-t border-hairline">
          {posts.map((post, index) => (
            <PostCard key={post.slug} post={post} stagger={index + 2} />
          ))}
        </ul>
      )}
    </div>
  );
}
