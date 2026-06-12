import Link from "next/link";
import { auth, signOut } from "@/auth";
import { PinMark } from "@/components/PinMark";
import { formatDate } from "@/lib/format";
import { listPosts } from "@/lib/posts";
import { deletePostAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const [posts, session] = await Promise.all([listPosts(), auth()]);

  return (
    <div className="mx-auto max-w-3xl px-6 pt-12 sm:pt-16">
      <nav className="flex items-center justify-between">
        <Link href="/" className="ink-link smallcaps text-sm text-muted">
          ← Home
        </Link>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="ink-link smallcaps text-sm text-faint"
          >
            Sign out {session?.user?.name ?? ""}
          </button>
        </form>
      </nav>

      <header className="mt-12 flex items-baseline justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
        <Link href="/admin/new" className="ink-link smallcaps text-muted">
          New post
        </Link>
      </header>

      {posts.length === 0 ? (
        <p className="mt-10 italic text-faint">
          Nothing here yet. Begin with a new post.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-hairline border-t border-hairline">
          {posts.map((post) => (
            <li
              key={post.slug}
              className="flex items-baseline justify-between gap-4 py-4"
            >
              <div className="min-w-0">
                <p className="truncate text-lg font-bold">
                  {post.title}
                  {post.pinned && (
                    <>
                      {" "}
                      <PinMark />
                    </>
                  )}
                </p>
                <p className="mt-0.5 text-sm text-faint">
                  /{post.slug}
                  <span aria-hidden className="mx-2">
                    ·
                  </span>
                  {formatDate(post.updatedAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-baseline gap-4 text-sm">
                <Link
                  href={`/admin/${encodeURIComponent(post.slug)}/edit`}
                  className="ink-link smallcaps text-muted"
                >
                  Edit
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await deletePostAction(post.slug);
                  }}
                >
                  <button
                    type="submit"
                    className="ink-link smallcaps text-accent"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
