import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

process.env.DATABASE_URL ??= "postgres://test:test@localhost/test";

const { parseV1Markdown, v1Slug, slugWarnings } = await import("./migrate-v1");

describe("parseV1Markdown", () => {
  it("parses the sample post fixture", async () => {
    const raw = await readFile("md/Leaving The Forest.md", "utf8");
    const parsed = parseV1Markdown(raw);
    expect(parsed.tags).toEqual(["poetry", "example"]);
    expect(parsed.pinned).toBe(true);
    expect(parsed.mdContent.startsWith("# Leaving The Forest")).toBe(true);
    expect(parsed.mdContent).not.toContain("{poetry}");
  });

  it("extracts tags from a {tag}{tag2} first line", () => {
    const parsed = parseV1Markdown("{a}{b}\n# Title\nbody");
    expect(parsed.tags).toEqual(["a", "b"]);
    expect(parsed.pinned).toBe(false);
    expect(parsed.mdContent).toBe("# Title\nbody");
  });

  it("treats pinned as a flag, not a tag", () => {
    const parsed = parseV1Markdown("{pinned}\ncontent");
    expect(parsed.tags).toEqual([]);
    expect(parsed.pinned).toBe(true);
  });

  it("leaves content without a tag line untouched", () => {
    const raw = "# No tags here\n\nbody";
    expect(parseV1Markdown(raw)).toEqual({
      tags: [],
      pinned: false,
      mdContent: raw,
    });
  });

  it("does not treat braces mid-line as a tag line", () => {
    const raw = "some {thing} else\nbody";
    expect(parseV1Markdown(raw).tags).toEqual([]);
    expect(parseV1Markdown(raw).mdContent).toBe(raw);
  });
});

describe("v1Slug", () => {
  it("replaces spaces with dashes, preserving case", () => {
    expect(v1Slug("Leaving The Forest")).toBe("Leaving-The-Forest");
    expect(v1Slug("already-dashed")).toBe("already-dashed");
  });
});

describe("slugWarnings", () => {
  it("flags URL-breaking characters", () => {
    expect(slugWarnings("What?-Why/How")).toEqual(["?", "/"]);
    expect(slugWarnings("Safe-Title")).toEqual([]);
  });
});
