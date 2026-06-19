import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * Crawlers that harvest pages to train (or feed) large language models.
 * General/search bots stay welcome — these are opted out of the whole site.
 * Tokens are the published opt-out user-agents for each operator.
 */
export const AI_TRAINING_BOTS = [
  "GPTBot", // OpenAI training crawler
  "ChatGPT-User", // OpenAI on-demand fetch
  "OAI-SearchBot", // OpenAI
  "CCBot", // Common Crawl (feeds many training sets)
  "Google-Extended", // Gemini training (does not affect Google Search)
  "anthropic-ai", // Anthropic
  "ClaudeBot", // Anthropic crawler
  "Claude-Web", // Anthropic
  "PerplexityBot", // Perplexity
  "Applebot-Extended", // Apple AI training (does not affect Siri/Spotlight)
  "Bytespider", // ByteDance
  "Amazonbot", // Amazon
  "FacebookBot", // Meta
  "Meta-ExternalAgent", // Meta AI
  "cohere-ai", // Cohere
  "Diffbot",
  "ImagesiftBot",
  "Omgilibot",
  "Timpibot",
  "PetalBot", // Huawei
  "YouBot", // You.com
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/admin" },
      ...AI_TRAINING_BOTS.map((userAgent) => ({ userAgent, disallow: "/" })),
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
