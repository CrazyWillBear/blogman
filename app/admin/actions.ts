"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { renderMarkdown } from "@/lib/markdown";
import { createPost, deletePost, updatePost } from "@/lib/posts";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
}

function parseTags(raw: string): string[] {
  return [...new Set(raw.split(",").map((t) => t.trim()).filter(Boolean))];
}

function postFields(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required");
  return {
    title,
    mdContent: String(formData.get("mdContent") ?? ""),
    tags: parseTags(String(formData.get("tags") ?? "")),
    pinned: formData.get("pinned") === "on",
  };
}

export async function createPostAction(formData: FormData) {
  await requireAdmin();
  const post = await createPost(postFields(formData));
  revalidatePath("/");
  redirect(`/admin?saved=${encodeURIComponent(post.slug)}`);
}

export async function updatePostAction(slug: string, formData: FormData) {
  await requireAdmin();
  const post = await updatePost(slug, postFields(formData));
  if (!post) throw new Error(`No post with slug "${slug}"`);
  revalidatePath("/");
  revalidatePath(`/${slug}`);
  redirect(`/admin?saved=${encodeURIComponent(post.slug)}`);
}

export async function deletePostAction(slug: string) {
  await requireAdmin();
  await deletePost(slug);
  revalidatePath("/");
  revalidatePath(`/${slug}`);
}

/** Renders markdown for the editor's live preview pane. */
export async function previewAction(md: string): Promise<string> {
  await requireAdmin();
  return renderMarkdown(md);
}
