import { blogConfig } from "@/blog.config";
import { ogCard } from "@/lib/og";
import { siteHost } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${blogConfig.name} — ${blogConfig.description[0]}`;

export default async function Image() {
  return ogCard({
    variant: "home",
    title: blogConfig.name,
    tagline: blogConfig.description[0],
    domain: siteHost(),
  });
}
