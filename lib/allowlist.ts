/** Parse ADMIN_GITHUB_LOGINS (comma-separated GitHub logins) into a normalized list. */
export function parseAllowlist(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((login) => login.trim().toLowerCase())
    .filter(Boolean);
}

/** GitHub logins are case-insensitive; an empty allowlist admits no one. */
export function isAllowedLogin(
  login: string | undefined,
  allowlist: string[],
): boolean {
  if (!login) return false;
  return allowlist.includes(login.toLowerCase());
}
