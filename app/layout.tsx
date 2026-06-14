import type { Metadata } from "next";
import { Crimson_Pro, IBM_Plex_Mono } from "next/font/google";
import { blogConfig } from "@/blog.config";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const serif = Crimson_Pro({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: blogConfig.name,
    template: `%s · ${blogConfig.name}`,
  },
  description: blogConfig.description[0],
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/feed.xml" },
  },
  openGraph: {
    type: "website",
    siteName: blogConfig.name,
    url: "/",
    locale: "en_US",
    title: blogConfig.name,
    description: blogConfig.description[0],
  },
  twitter: {
    card: "summary_large_image",
    title: blogConfig.name,
    description: blogConfig.description[0],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${serif.variable} ${mono.variable} antialiased`}>
      <body>
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>
          <footer className="mt-20 border-t border-hairline py-8">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-1.5 px-6 text-sm text-faint">
              <p>{blogConfig.footer}</p>
              <nav className="flex gap-4">
                {blogConfig.links.map((link) => (
                  <a key={link.href} href={link.href} className="ink-link">
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
