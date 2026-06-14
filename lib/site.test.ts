import { afterEach, describe, expect, it, vi } from "vitest";
import { absoluteUrl, siteUrl } from "./site";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("siteUrl", () => {
  it("uses SITE_URL verbatim when set", () => {
    vi.stubEnv("SITE_URL", "https://blog.williamchastain.com");
    expect(siteUrl()).toBe("https://blog.williamchastain.com");
  });

  it("strips a trailing slash from SITE_URL", () => {
    vi.stubEnv("SITE_URL", "https://blog.williamchastain.com/");
    expect(siteUrl()).toBe("https://blog.williamchastain.com");
  });

  it("strips multiple trailing slashes from SITE_URL", () => {
    vi.stubEnv("SITE_URL", "https://example.com///");
    expect(siteUrl()).toBe("https://example.com");
  });

  it("trims surrounding whitespace on SITE_URL", () => {
    vi.stubEnv("SITE_URL", "  https://example.com/  ");
    expect(siteUrl()).toBe("https://example.com");
  });

  it("prefixes VERCEL_PROJECT_PRODUCTION_URL with https:// when SITE_URL is unset", () => {
    vi.stubEnv("SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "blog.williamchastain.com");
    expect(siteUrl()).toBe("https://blog.williamchastain.com");
  });

  it("prefers SITE_URL over VERCEL_PROJECT_PRODUCTION_URL", () => {
    vi.stubEnv("SITE_URL", "https://override.example.com");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "vercel.example.com");
    expect(siteUrl()).toBe("https://override.example.com");
  });

  it("strips a trailing slash from the Vercel-derived URL", () => {
    vi.stubEnv("SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "example.com/");
    expect(siteUrl()).toBe("https://example.com");
  });

  it("falls back to localhost when neither is set", () => {
    vi.stubEnv("SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    expect(siteUrl()).toBe("http://localhost:3000");
  });

  it("ignores a whitespace-only SITE_URL and falls through", () => {
    vi.stubEnv("SITE_URL", "   ");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "example.com");
    expect(siteUrl()).toBe("https://example.com");
  });
});

describe("absoluteUrl", () => {
  it("joins a path with a leading slash without doubling it", () => {
    vi.stubEnv("SITE_URL", "https://example.com");
    expect(absoluteUrl("/posts/hello")).toBe("https://example.com/posts/hello");
  });

  it("joins a path that lacks a leading slash", () => {
    vi.stubEnv("SITE_URL", "https://example.com");
    expect(absoluteUrl("posts/hello")).toBe("https://example.com/posts/hello");
  });

  it("collapses redundant leading slashes on the path", () => {
    vi.stubEnv("SITE_URL", "https://example.com");
    expect(absoluteUrl("///feed.xml")).toBe("https://example.com/feed.xml");
  });

  it("returns the base URL unchanged for an empty path", () => {
    vi.stubEnv("SITE_URL", "https://example.com");
    expect(absoluteUrl("")).toBe("https://example.com");
  });

  it("uses the resolved base URL, not a hardcoded one", () => {
    vi.stubEnv("SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    expect(absoluteUrl("/sitemap.xml")).toBe(
      "http://localhost:3000/sitemap.xml",
    );
  });
});
