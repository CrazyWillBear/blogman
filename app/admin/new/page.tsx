import Link from "next/link";
import { PostEditor } from "@/components/PostEditor";
import { createPostAction } from "../actions";

export const metadata = { title: "New Post" };

export default function NewPostPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-12 sm:pt-16">
      <nav>
        <Link href="/admin" className="ink-link smallcaps text-sm text-muted">
          ← Posts
        </Link>
      </nav>
      <h1 className="mt-8 mb-10 text-3xl font-bold tracking-tight">
        New Post
      </h1>
      <PostEditor action={createPostAction} submitLabel="Publish" />
    </div>
  );
}
