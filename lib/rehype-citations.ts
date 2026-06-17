import type { Element, ElementContent, Root, Text } from "hast";
import type { Plugin } from "unified";

/**
 * Auto-link numeric `[n]` citations to a manually-authored source list.
 *
 * A "source list" is a paragraph whose `<br>`-separated lines each start with
 * `[n]` (e.g. the "Sources Cited" block: `[1] Aristotle...<br>[2] Kant...`).
 * Heading text is irrelevant — detection is purely structural. When such a list
 * exists, every source line gains an `id="cite-n"` anchor (its literal `[n]`
 * marker is kept), and every other `[n]` in the document (n present in the list)
 * becomes a bracketed superscript link `⁽ⁿ⁾` pointing at `#cite-n`.
 *
 * Posts without a source list are left untouched, so existing posts that happen
 * to contain a bracketed number are unaffected. GFM footnotes (`[^1]`, bare
 * superscript) are a separate system and stay visually distinct.
 *
 * Runs after rehype-pretty-code and before rehype-sanitize. `[n]` inside
 * `<code>`/`<pre>` is skipped, as is the source list itself (its markers are the
 * link targets). The injected `sup`/`a`/`span`/`id`/`className` all survive the
 * sanitize schema; `cite-*` ids match their `#cite-*` hrefs only because the
 * schema sets `clobberPrefix: ""` (see lib/markdown.ts).
 */

const isElement = (n: ElementContent): n is Element => n.type === "element";
const isText = (n: ElementContent): n is Text => n.type === "text";
const isBlank = (n: ElementContent): boolean => isText(n) && n.value.trim() === "";

/** A bracketed-superscript citation link: `<sup class="citation"><a href="#cite-n">(n)</a></sup>`. */
function citation(n: number): Element {
  return {
    type: "element",
    tagName: "sup",
    properties: { className: ["citation"] },
    children: [
      {
        type: "element",
        tagName: "a",
        properties: { href: `#cite-${n}` },
        children: [{ type: "text", value: `(${n})` }],
      },
    ],
  };
}

/**
 * Split a text node on every `[n]` whose number is in `nums`, replacing each
 * with a citation link. Returns `null` when nothing matched (node left as-is).
 */
function linkify(value: string, nums: Set<number>): ElementContent[] | null {
  const out: ElementContent[] = [];
  let last = 0;
  let changed = false;
  for (const m of value.matchAll(/\[(\d+)\]/g)) {
    const index = m.index ?? 0;
    const n = Number(m[1]);
    if (!nums.has(n)) continue;
    changed = true;
    if (index > last) out.push({ type: "text", value: value.slice(last, index) });
    out.push(citation(n));
    last = index + m[0].length;
  }
  if (!changed) return null;
  if (last < value.length) out.push({ type: "text", value: value.slice(last) });
  return out;
}

/** Collect every `<p>` element in the tree (source lists are paragraphs). */
function collectParagraphs(node: Root | Element, acc: Element[]): void {
  for (const child of node.children as ElementContent[]) {
    if (isElement(child)) {
      if (child.tagName === "p") acc.push(child);
      collectParagraphs(child, acc);
    }
  }
}

/**
 * If `p` is a source list (≥2 non-empty `<br>`-separated lines, each starting
 * with `[n]`), return the set of numbers; otherwise `null`. Requiring every
 * non-empty line to match avoids false positives on prose that merely mentions
 * a bracketed number.
 */
function analyzeSource(p: Element): Set<number> | null {
  const lines: ElementContent[][] = [[]];
  for (const child of p.children) {
    if (isElement(child) && child.tagName === "br") lines.push([]);
    else lines[lines.length - 1].push(child);
  }
  const nums = new Set<number>();
  let nonEmpty = 0;
  let matched = 0;
  for (const line of lines) {
    const first = line.find((n) => !isBlank(n));
    if (!first) continue;
    nonEmpty++;
    if (isText(first)) {
      const mm = first.value.match(/^\s*\[(\d+)\]/);
      if (mm) {
        matched++;
        nums.add(Number(mm[1]));
      }
    }
  }
  return nonEmpty >= 2 && matched === nonEmpty ? nums : null;
}

/** Wrap each source line's leading `[n]` in `<span id="cite-n">[n]</span>`. */
function tagSourceMarkers(p: Element): void {
  const out: ElementContent[] = [];
  let atLineStart = true;
  for (const child of p.children) {
    if (isElement(child) && child.tagName === "br") {
      out.push(child);
      atLineStart = true;
      continue;
    }
    if (atLineStart && isText(child)) {
      const mm = child.value.match(/^(\s*)\[(\d+)\]/);
      if (mm) {
        const n = Number(mm[2]);
        if (mm[1]) out.push({ type: "text", value: mm[1] });
        out.push({
          type: "element",
          tagName: "span",
          properties: { id: `cite-${n}` },
          children: [{ type: "text", value: `[${n}]` }],
        });
        const rest = child.value.slice(mm[0].length);
        if (rest) out.push({ type: "text", value: rest });
        atLineStart = false;
        continue;
      }
    }
    if (!isBlank(child)) atLineStart = false;
    out.push(child);
  }
  p.children = out;
}

/**
 * Recurse the tree, replacing `[n]` in text nodes with citation links. Subtrees
 * rooted at `<code>`/`<pre>` and the source list(s) are skipped; replacement is
 * suppressed inside `<a>` to avoid nested anchors.
 */
function walk(
  children: ElementContent[],
  insideAnchor: boolean,
  nums: Set<number>,
  sources: Set<Element>,
): ElementContent[] {
  const out: ElementContent[] = [];
  for (const child of children) {
    if (isElement(child)) {
      if (child.tagName === "code" || child.tagName === "pre" || sources.has(child)) {
        out.push(child);
        continue;
      }
      const anchorNow = insideAnchor || child.tagName === "a";
      child.children = walk(child.children, anchorNow, nums, sources);
      out.push(child);
    } else if (isText(child) && !insideAnchor) {
      const repl = linkify(child.value, nums);
      if (repl) out.push(...repl);
      else out.push(child);
    } else {
      out.push(child);
    }
  }
  return out;
}

const rehypeCitations: Plugin<[], Root> = () => (tree) => {
  const paragraphs: Element[] = [];
  collectParagraphs(tree, paragraphs);

  const nums = new Set<number>();
  const sources = new Set<Element>();
  for (const p of paragraphs) {
    const found = analyzeSource(p);
    if (found) {
      for (const n of found) nums.add(n);
      tagSourceMarkers(p);
      sources.add(p);
    }
  }

  if (nums.size === 0) return;
  tree.children = walk(tree.children as ElementContent[], false, nums, sources);
};

export default rehypeCitations;
