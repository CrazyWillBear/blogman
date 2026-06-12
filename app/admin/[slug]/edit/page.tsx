import Link from "next/link";
import { notFound } from "next/navigation";
import { PostEditor } from "@/components/PostEditor";
import { getPostBySlug } from "@/lib/posts";
import { updatePostAction } from "../../actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Edit Post" };

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(decodeURIComponent(slug));
  if (!post) notFound();

  const action = updatePostAction.bind(null, post.slug);

  return (
    <div className="mx-auto max-w-6xl px-6 pt-12 sm:pt-16">
      <nav>
        <Link
          href="/admin"
          className="gold-underline smallcaps text-sm text-parchment-dim"
        >
          ← Scriptorium
        </Link>
      </nav>
      <h1 className="font-display mt-8 text-4xl font-semibold text-parchment">
        Edit “{post.title}”
      </h1>
      <div aria-hidden className="ornament-divider my-8">
        ❦
      </div>
      <PostEditor post={post} action={action} submitLabel="Save" />
    </div>
  );
}
