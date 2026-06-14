import { blogConfig } from "@/blog.config";
import { ogCard } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${blogConfig.name} — ${blogConfig.description[0]}`;

export default async function Image() {
  return ogCard({
    title: blogConfig.name,
    siteName: blogConfig.name,
    kicker: undefined,
  });
}
