/**
 * Blog identity. Edit this file (plus .env) to make the engine yours —
 * no code changes needed.
 */
export const blogConfig = {
  /** Shown in the masthead and the <title> tag. */
  name: "CrazyWillBear's Blog",

  /** One entry per homepage description paragraph. */
  description: [
    "Yet another blog full of thoughts and ideas. I write about software, poetry, and whatever else crosses my mind.",
    "Powered by blogman, a reusable blog engine you can clone and deploy yourself.",
  ],

  /** Footer line. */
  footer: "Built with blogman",

  /** Footer links. */
  links: [{ label: "Source", href: "https://github.com/CrazyWillBear/blogman" }],
};

export type BlogConfig = typeof blogConfig;
