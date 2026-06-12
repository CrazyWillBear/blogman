import rehypePrettyCode from "rehype-pretty-code";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

/**
 * Default schema plus the inline HTML v1 posts rely on (<br>, <hr>).
 * Scripts and event handlers stay stripped. Code-block styling spans from
 * rehype-pretty-code need their data-* attributes and style kept.
 */
const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "br", "hr", "figure", "figcaption"],
  attributes: {
    ...defaultSchema.attributes,
    "*": [
      ...(defaultSchema.attributes?.["*"] ?? []),
      "className",
      "style",
      "dataLanguage",
      "dataTheme",
      "dataHighlightedLine",
      "dataHighlightedChars",
      "dataLineNumbers",
      "dataRehypePrettyCode",
      "dataRehypePrettyCodeFigure",
      "dataRehypePrettyCodeTitle",
      "dataRehypePrettyCodeCaption",
      "dataLine",
    ],
  },
};

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypePrettyCode, {
    theme: "min-light",
    keepBackground: false,
    defaultLang: "text",
  })
  .use(rehypeSanitize, schema)
  .use(rehypeStringify);

/** Render trusted-author markdown to sanitized HTML (GFM + inline HTML, scripts stripped). */
export async function renderMarkdown(md: string): Promise<string> {
  const file = await processor.process(md);
  return String(file);
}
