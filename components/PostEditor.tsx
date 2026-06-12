"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { Post } from "@/db/schema";
import { previewAction } from "@/app/admin/actions";

const inputClass =
  "w-full border border-hairline bg-transparent px-3.5 py-2.5 placeholder:text-faint focus:border-ink focus:outline-none transition-colors duration-200";

/** Editor form with a live preview pane, used by /admin/new and /admin/[slug]/edit. */
export function PostEditor({
  post,
  action,
  submitLabel,
}: {
  post?: Post;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
}) {
  const [md, setMd] = useState(post?.mdContent ?? "");
  const [previewHtml, setPreviewHtml] = useState("");
  const [, startPreview] = useTransition();
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      startPreview(async () => {
        setPreviewHtml(md.trim() ? await previewAction(md) : "");
      });
    }, 400);
    return () => clearTimeout(debounce.current);
  }, [md]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form action={action} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="smallcaps text-sm text-muted">Title</span>
          <input
            name="title"
            required
            defaultValue={post?.title ?? ""}
            placeholder="A Remarkable Title"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="smallcaps text-sm text-muted">
            Tags <span className="normal-case text-faint">(comma-separated)</span>
          </span>
          <input
            name="tags"
            defaultValue={post?.tags.join(", ") ?? ""}
            placeholder="poetry, example"
            className={inputClass}
          />
        </label>

        <label className="flex items-center gap-2.5 text-sm text-muted">
          <input
            type="checkbox"
            name="pinned"
            defaultChecked={post?.pinned ?? false}
            className="h-4 w-4 accent-[var(--ink)]"
          />
          <span className="smallcaps">Pin to the top</span>
        </label>

        <label className="flex flex-1 flex-col gap-1.5">
          <span className="smallcaps text-sm text-muted">Markdown</span>
          <textarea
            name="mdContent"
            value={md}
            onChange={(e) => setMd(e.target.value)}
            rows={20}
            placeholder="# Begin here…"
            className={`${inputClass} min-h-[24rem] flex-1 resize-y font-mono text-sm leading-relaxed`}
          />
        </label>

        <button
          type="submit"
          className="smallcaps self-start border border-ink px-6 py-2.5 transition-colors duration-200 hover:bg-ink hover:text-paper"
        >
          {submitLabel}
        </button>
      </form>

      <section aria-label="Preview" className="min-w-0">
        <p className="smallcaps mb-3 text-sm text-muted">Preview</p>
        <div className="border border-hairline px-6 py-5">
          {previewHtml ? (
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          ) : (
            <p className="italic text-faint">
              The preview appears as you write.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
