import Link from "next/link";
import { PostEditor } from "@/components/PostEditor";
import { createPostAction } from "../actions";

export const metadata = { title: "New Post" };

export default function NewPostPage() {
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
        New Post
      </h1>
      <div aria-hidden className="ornament-divider my-8">
        ❦
      </div>
      <PostEditor action={createPostAction} submitLabel="Publish" />
    </div>
  );
}
