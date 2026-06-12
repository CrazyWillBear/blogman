import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  JetBrains_Mono,
  Source_Serif_4,
} from "next/font/google";
import { blogConfig } from "@/blog.config";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const body = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: blogConfig.name,
    template: `%s · ${blogConfig.name}`,
  },
  description: blogConfig.description[0],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full">
        <div className="relative z-10 flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>
          <footer className="mt-16 border-t border-hairline-faint py-8">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 px-6 text-sm text-parchment-faint">
              <span aria-hidden className="text-gold">
                ❦
              </span>
              <p>{blogConfig.footer}</p>
              <nav className="flex gap-4">
                {blogConfig.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="gold-underline text-parchment-dim"
                  >
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
