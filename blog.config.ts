/**
 * Blog identity. Edit this file (plus .env) to make the engine yours —
 * no code changes needed.
 */
export const blogConfig = {
  /** Shown in the masthead and the <title> tag. */
  name: "William Chastain's Blog",

  /** One entry per homepage description paragraph. */
  description: [
    "My personal writing collection. I write about AI, philosophy, and whatever else.",
  ],

  /** Footer line. */
  footer: "Built with blogman",

  /** Footer links. */
  links: [{ label: "Source", href: "https://github.com/CrazyWillBear/blogman" }],
};

export type BlogConfig = typeof blogConfig;
