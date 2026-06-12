import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  it("renders basic markdown", async () => {
    const html = await renderMarkdown("# Title\n\nA *styled* paragraph.");
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<em>styled</em>");
  });

  it("renders GFM tables", async () => {
    const html = await renderMarkdown("| a | b |\n|---|---|\n| 1 | 2 |");
    expect(html).toContain("<table>");
    expect(html).toContain("<td>1</td>");
  });

  it("highlights fenced code blocks", async () => {
    const html = await renderMarkdown('```python\nprint("hi")\n```');
    expect(html).toContain("<pre");
    expect(html).toContain("<code");
    expect(html).toContain("print");
  });

  it("keeps the inline HTML v1 posts use", async () => {
    const html = await renderMarkdown("line\n\n<br />\n\n<hr>\n\nmore");
    expect(html).toContain("<br");
    expect(html).toContain("<hr");
  });

  it("strips script tags and event handlers", async () => {
    const html = await renderMarkdown(
      '<script>alert(1)</script>\n\n<img src="x" onerror="alert(1)">\n\ntext',
    );
    expect(html).not.toContain("<script");
    expect(html).not.toContain("alert(1)");
    expect(html).not.toContain("onerror");
  });

  it("strips javascript: links", async () => {
    const html = await renderMarkdown("[click](javascript:alert(1))");
    expect(html).not.toContain("javascript:");
  });

  it("renders the full sample post", async () => {
    const { readFile } = await import("node:fs/promises");
    const raw = await readFile("md/Leaving The Forest.md", "utf8");
    const md = raw.slice(raw.indexOf("\n") + 1);
    const html = await renderMarkdown(md);
    expect(html).toContain("<h1>Leaving The Forest</h1>");
    expect(html).toContain("<h4>By William B. Chastain</h4>");
    expect(html).toContain("<hr");
    expect(html).toContain("<br");
  });
});
