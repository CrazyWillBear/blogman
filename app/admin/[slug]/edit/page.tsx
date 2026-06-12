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
        <Link href="/admin" className="ink-link smallcaps text-sm text-muted">
          ← Posts
        </Link>
      </nav>
      <h1 className="mt-8 mb-10 text-3xl font-bold tracking-tight">
        Edit “{post.title}”
      </h1>
      <PostEditor post={post} action={action} submitLabel="Save" />
    </div>
  );
}
