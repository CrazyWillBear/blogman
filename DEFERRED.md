# Deferred items

- **GitHub OAuth login untested**: `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` are not
  in `.env.local` (prereq on Will's side — create the OAuth app with callback
  `http://localhost:3000/api/auth/callback/github`, then add both vars plus
  `ADMIN_GITHUB_LOGINS=CrazyWillBear`). Auth code, middleware, and the allowlist
  are implemented and unit-tested; the interactive login/admin flow needs the
  creds to verify end-to-end. `AUTH_SECRET` already generated and saved.
