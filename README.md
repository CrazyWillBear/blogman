# blogman

A reusable, self-hostable blog engine. Write Markdown in a web editor, store it
in Postgres, deploy anywhere Next.js runs (built Vercel-first). Dark academia
out of the box; restyle it with an AI agent in minutes (see
[Customizing with an AI agent](#customizing-with-an-ai-agent)).

**Stack:** Next.js (App Router, TypeScript) · Tailwind CSS v4 · Drizzle ORM +
Neon Postgres · Auth.js (GitHub OAuth) · remark/rehype Markdown pipeline with
syntax highlighting.

**Features**

- Markdown posts with GFM (tables, fenced code + syntax highlighting) and safe
  inline HTML (`<script>` is always stripped).
- Homepage search (title, content, tags) and sorting (created/modified,
  asc/desc) via GET params — results are linkable.
- Pinned posts always sort first, marked with a wax seal.
- Auth-protected `/admin` editor: live preview, tag input, pin toggle.
- Single-table Postgres schema; no filesystem storage, serverless-friendly.

## Quickstart

1. **Clone and install**

   ```sh
   git clone https://github.com/CrazyWillBear/blogman && cd blogman
   npm install
   ```

2. **Create a Neon database** at [neon.tech](https://neon.tech) (free tier is
   fine) and copy the connection string.

3. **Create a GitHub OAuth app** at GitHub → Settings → Developer settings →
   OAuth Apps. Callback URL for local dev:
   `http://localhost:3000/api/auth/callback/github` (add a second app or
   update the URL for production).

4. **Configure env**: `cp .env.example .env.local` and fill it in.
   `ADMIN_GITHUB_LOGINS` is a comma-separated list of GitHub usernames allowed
   into the editor. Generate `AUTH_SECRET` with `npx auth secret` or
   `openssl rand -base64 32`.

5. **Create the schema**

   ```sh
   npm run db:migrate
   ```

6. **Run**

   ```sh
   npm run dev
   ```

   Sign in at `/admin` and write your first post.

7. **Make it yours**: edit `blog.config.ts` (name, description, footer links).

## Deploying to Vercel

Import the repo in Vercel, set the same env vars (`DATABASE_URL`,
`AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`,
`ADMIN_GITHUB_LOGINS`), and point your production GitHub OAuth app's callback
at `https://<your-domain>/api/auth/callback/github`. No other config — there
is no filesystem storage or long-lived process.

## Migrating from blogman v1

v1 stored posts as Markdown files in `md/` with rendered JSON caches in
`blogs/`. To bring that content into the database:

1. Put your v1 `md/` and `blogs/` directories at the repo root (sample content
   ships in this repo as a demo).
2. Run:

   ```sh
   npx tsx scripts/migrate-v1.ts
   ```

The script parses the v1 first-line `{tag}{tag2}` syntax (the magic `pinned`
tag becomes the pinned flag), takes created/modified dates from the JSON
caches when present, and preserves your exact v1 slugs
(`Title-With-Dashes`, case kept) so existing URLs keep working. It upserts by
slug — safe to re-run. New posts created in the editor get normal
lowercase-kebab slugs.

## Customizing with an AI agent

The engine is built to be restyled and reconfigured by AI coding agents
(Claude Code, etc.). `CLAUDE.md` carries the project rules so an agent knows
the checks to run. Paste-ready prompts:

> Rebrand this blog: update `blog.config.ts` with my blog name "…" and a
> description about …, and update the footer links to point at my GitHub.

> Restyle the blog from dark academia to a [minimal light / brutalist /
> retro-futuristic] theme. The full design system lives in `app/globals.css`
> (CSS variables, ornaments, prose styles) and the fonts in `app/layout.tsx`.
> Keep the layout structure and accessibility intact, then run
> `npm run check` and `npm run build`.

> Add an RSS feed at `/feed.xml` using the existing `lib/posts.ts` query
> helpers, following the conventions in CLAUDE.md.

Useful knobs: `blog.config.ts` (identity), `app/globals.css` (palette,
texture, type scale), `app/layout.tsx` (fonts), `components/` (cards, seals,
controls), `lib/markdown.ts` (markdown features and sanitization).

## Development

```sh
npm run dev          # dev server
npm run check        # lint + typecheck + tests (Vitest)
npm run build        # production build
npm run db:generate  # generate SQL migration after schema changes
npm run db:migrate   # apply migrations
```

CI runs the same checks on every push.

## License

[MIT](LICENSE)
