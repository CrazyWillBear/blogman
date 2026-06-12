# CLAUDE.md

Blogman v2 — a reusable blog engine: Next.js (App Router, TypeScript),
Tailwind v4, Drizzle ORM on Neon Postgres, Auth.js (GitHub) guarding the
`/admin` editor.

## Rules

- **Frontend work**: invoke the `frontend-design` skill before any frontend
  change. The design language is dark academia (palette/type/ornament in
  `app/globals.css`) — stay inside it.
- **Done-check** (run before declaring any change done):
  `npm run check` (lint + typecheck + Vitest) **and** `npm run build`.
- Blog identity lives in `blog.config.ts`; secrets in `.env.local`
  (see `.env.example`). Never hardcode either.

## Layout

- `app/` — routes: `/` (search/sort homepage), `/[slug]` (post),
  `/admin/**` (auth-guarded editor), `/api/auth/[...nextauth]`.
- `lib/` — `posts.ts` (queries), `markdown.ts` (remark/rehype pipeline),
  `sort.ts` (client-safe sort constants — keep db imports out of anything a
  client component touches), `allowlist.ts` (admin allowlist).
- `db/` — Drizzle schema + migrations (`npm run db:generate`, `db:migrate`).
- `scripts/migrate-v1.ts` — imports v1 (`md/` + `blogs/`) content; idempotent.

## Conventions

- Conventional commits.
- Tests colocated as `*.test.ts`; new logic gets Vitest coverage.
- Old v1 slugs (`Title-With-Dashes`, case preserved) must keep resolving —
  don't "normalize" existing slugs.
