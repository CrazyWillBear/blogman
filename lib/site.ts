/**
 * Resolve the canonical base URL of the deployed site, server-side.
 *
 * Resolution order:
 *   1. SITE_URL — a full URL, used verbatim (trailing slash stripped).
 *   2. VERCEL_PROJECT_PRODUCTION_URL — a bare host Vercel injects in prod;
 *      prefixed with https:// since it omits the scheme.
 *   3. http://localhost:3000 — the dev fallback.
 *
 * These read process.env, so this module is server-only — keep it out of
 * anything a client component touches.
 */

const LOCALHOST = "http://localhost:3000";

/** The resolved base URL, with no trailing slash. */
export function siteUrl(): string {
  const explicit = process.env.SITE_URL?.trim();
  if (explicit) return stripTrailingSlash(explicit);

  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelHost) return stripTrailingSlash(`https://${vercelHost}`);

  return LOCALHOST;
}

/** Join a path onto {@link siteUrl}, tolerating a leading slash (or not). */
export function absoluteUrl(path: string): string {
  const base = siteUrl();
  if (!path) return base;
  return `${base}/${path.replace(/^\/+/, "")}`;
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}
