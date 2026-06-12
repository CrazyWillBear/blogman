import Link from "next/link";
import { auth, signOut } from "@/auth";
import { WaxSeal } from "@/components/WaxSeal";
import { formatDate } from "@/lib/format";
import { listPosts } from "@/lib/posts";
import { deletePostAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Scriptorium" };

export default async function AdminPage() {
  const [posts, session] = await Promise.all([listPosts(), auth()]);

  return (
    <div className="mx-auto max-w-3xl px-6 pt-12 sm:pt-16">
      <nav className="flex items-center justify-between">
        <Link
          href="/"
          className="gold-underline smallcaps text-sm text-parchment-dim"
        >
          ← The Archive
        </Link>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="gold-underline smallcaps text-sm text-parchment-faint"
          >
            Sign out {session?.user?.name ?? ""}
          </button>
        </form>
      </nav>

      <header className="mt-10 flex items-end justify-between">
        <div>
          <p aria-hidden className="smallcaps text-xs text-gold">
            Scriptorium
          </p>
          <h1 className="font-display mt-2 text-4xl font-semibold text-parchment">
            Manage Posts
          </h1>
        </div>
        <Link
          href="/admin/new"
          className="smallcaps border border-hairline px-5 py-2.5 text-sm text-gold-bright transition-colors duration-300 hover:border-oxblood hover:bg-oxblood hover:text-parchment"
        >
          New Post
        </Link>
      </header>

      <div aria-hidden className="ornament-divider my-8">
        ❦
      </div>

      {posts.length === 0 ? (
        <p className="text-center italic text-parchment-faint">
          The archive is empty. Begin with a new post.
        </p>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li
              key={post.slug}
              className="flex items-center justify-between gap-4 border border-hairline-faint bg-ink-raised/60 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2.5 truncate font-display text-xl font-semibold text-parchment">
                  {post.title}
                  {post.pinned && <WaxSeal />}
                </p>
                <p className="mt-1 text-xs text-parchment-faint">
                  /{post.slug}
                  <span aria-hidden className="mx-2 text-gold">
                    ·
                  </span>
                  {formatDate(post.updatedAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <Link
                  href={`/admin/${encodeURIComponent(post.slug)}/edit`}
                  className="gold-underline smallcaps text-sm text-gold-bright"
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
                    className="gold-underline smallcaps text-sm text-oxblood-bright"
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
