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

  it("renders a full v1-style post", async () => {
    const md = [
      "# Leaving The Forest",
      "",
      "#### By William B. Chastain",
      "",
      "<hr>",
      "",
      "At the crossroads",
      "",
      "<br />",
      "",
      "I walk slow.",
    ].join("\n");
    const html = await renderMarkdown(md);
    expect(html).toContain("<h1>Leaving The Forest</h1>");
    expect(html).toContain("<h4>By William B. Chastain</h4>");
    expect(html).toContain("<hr");
    expect(html).toContain("<br");
  });
});

describe("GFM footnotes", () => {
  const md = "Body text[^1] more.\n\n[^1]: A note.";

  it("links the footnote ref to its definition with a single prefix", async () => {
    const html = await renderMarkdown(md);
    expect(html).toContain('id="user-content-fn-1"');
    expect(html).toContain('href="#user-content-fn-1"');
    expect(html).not.toContain("user-content-user-content");
  });

  it("links the backref symmetrically", async () => {
    const html = await renderMarkdown(md);
    expect(html).toContain('id="user-content-fnref-1"');
    expect(html).toContain('href="#user-content-fnref-1"');
  });

  it("keeps aria-describedby pointing at the un-mangled label id", async () => {
    const html = await renderMarkdown(md);
    expect(html).toContain('aria-describedby="footnote-label"');
    expect(html).toContain('id="footnote-label"');
  });

  it("hides the auto Footnotes heading with sr-only", async () => {
    const html = await renderMarkdown(md);
    expect(html).toContain('class="sr-only"');
  });
});

describe("citation auto-linking", () => {
  const sources = [
    "## Sources Cited",
    "",
    "[1] Aristotle. Source one.  ",
    "[2] Kant. Source two.  ",
    "[10] SEP. https://plato.stanford.edu/x.  ",
  ].join("\n");

  it("links body [n] to its source and anchors the source entry", async () => {
    const html = await renderMarkdown(`See [1] here.\n\n${sources}`);
    expect(html).toContain('<sup class="citation"><a href="#cite-1">(1)</a></sup>');
    expect(html).toContain('<span id="cite-1">[1]</span>');
  });

  it("leaves the source markers themselves literal (no superscript)", async () => {
    const html = await renderMarkdown(`See [1].\n\n${sources}`);
    const sourcePart = html.slice(html.indexOf('<span id="cite-1">'));
    expect(sourcePart).not.toContain("(1)");
  });

  it("handles multi-digit and repeated refs in one text node", async () => {
    const html = await renderMarkdown(`A [1] and [10] and [1] again.\n\n${sources}`);
    expect(html.match(/<sup class="citation">/g) ?? []).toHaveLength(3);
    expect(html).toContain('href="#cite-10"');
    // [1] must not be read as the prefix of [10]
    expect(html).toContain('href="#cite-1">(1)');
  });

  it("leaves a reference with no matching source literal", async () => {
    const html = await renderMarkdown(`Missing [99].\n\n${sources}`);
    expect(html).toContain("[99]");
    expect(html).not.toContain("#cite-99");
  });

  it("does not match escaped brackets", async () => {
    const html = await renderMarkdown(`Kant calls it \\[the will\\].\n\n${sources}`);
    expect(html).toContain("[the will]");
    expect(html).not.toContain('<sup class="citation">');
  });

  it("skips [n] inside inline code but links adjacent prose", async () => {
    const html = await renderMarkdown(`Inline \`arr[1]\` stays, prose [1] links.\n\n${sources}`);
    expect(html.match(/<sup class="citation">/g) ?? []).toHaveLength(1);
  });

  it("skips [n] inside fenced code", async () => {
    const html = await renderMarkdown(`\`\`\`\nx = arr[1]\n\`\`\`\n\n${sources}`);
    expect(html.match(/<sup class="citation">/g) ?? []).toHaveLength(0);
  });

  it("links [n] inside a footnote definition", async () => {
    const html = await renderMarkdown(`Text[^a].\n\n[^a]: See [2] for detail.\n\n${sources}`);
    expect(html).toContain('href="#cite-2"');
  });

  it("keeps injected cite ids unprefixed after sanitize", async () => {
    const html = await renderMarkdown(`See [1].\n\n${sources}`);
    expect(html).toContain('id="cite-1"');
    expect(html).not.toContain("user-content-cite-1");
  });

  it("does not linkify when there is no source list (v1 posts unaffected)", async () => {
    const html = await renderMarkdown("A lone [1] reference with no sources.");
    expect(html).toContain("[1]");
    expect(html).not.toContain('<sup class="citation">');
    expect(html).not.toContain("#cite-1");
  });

  it("does not nest a citation link inside an existing anchor", async () => {
    const html = await renderMarkdown(`See [\\[1\\]](https://example.com).\n\n${sources}`);
    expect(html).toContain('<a href="https://example.com"');
    expect(html).not.toContain('<sup class="citation">');
  });
});
