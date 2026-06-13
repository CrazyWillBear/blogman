import { Fragment, Suspense } from "react";
import { blogConfig } from "@/blog.config";
import { PostCard } from "@/components/PostCard";
import { SearchControls } from "@/components/SearchControls";
import { DEFAULT_SORT, isSortOption, listPosts } from "@/lib/posts";

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
  const pinned = posts.filter((post) => post.pinned);
  const rest = posts.filter((post) => !post.pinned);

  return (
    <div className="mx-auto max-w-3xl px-6 pt-16 sm:pt-24">
      <header
        className="fade-up"
        style={{ "--stagger": 0 } as React.CSSProperties}
      >
        <h1 className="text-center text-4xl font-bold tracking-tight sm:text-5xl">
          {blogConfig.name}
        </h1>
        <div className="mt-5 max-w-2xl space-y-3 text-lg text-muted">
          {blogConfig.description.map((paragraph) => (
            <p key={paragraph}>{renderParagraph(paragraph)}</p>
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
      ) : pinned.length === 0 ? (
        <ul className="mt-10 divide-y divide-hairline border-t border-hairline">
          {rest.map((post, index) => (
            <PostCard key={post.slug} post={post} stagger={index + 2} />
          ))}
        </ul>
      ) : (
        <>
          <section className="mt-10">
            <h2
              className="smallcaps fade-up text-sm text-faint"
              style={{ "--stagger": 2 } as React.CSSProperties}
            >
              Pinned
            </h2>
            <ul className="mt-3 divide-y divide-hairline border-t border-hairline">
              {pinned.map((post, index) => (
                <PostCard key={post.slug} post={post} stagger={index + 3} />
              ))}
            </ul>
          </section>
          {rest.length > 0 && (
            <section className="mt-12">
              <h2
                className="smallcaps fade-up text-sm text-faint"
                style={
                  { "--stagger": pinned.length + 3 } as React.CSSProperties
                }
              >
                All posts
              </h2>
              <ul className="mt-3 divide-y divide-hairline border-t border-hairline">
                {rest.map((post, index) => (
                  <PostCard
                    key={post.slug}
                    post={post}
                    stagger={pinned.length + index + 4}
                  />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
