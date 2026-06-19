import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type DB = NeonHttpDatabase<typeof schema>;

let _db: DB | undefined;

/**
 * Build (once) the drizzle client. Reads DATABASE_URL at call time so importing
 * this module never requires the env var — Next collects page data by importing
 * route modules, and an eager `neon()` here would throw when DATABASE_URL is
 * unset (e.g. Vercel preview builds).
 */
function getDb(): DB {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    _db = drizzle(neon(url), { schema });
  }
  return _db;
}

/**
 * Lazy drizzle client. Construction is deferred to first property access, so a
 * bare `import { db }` is inert; only running a query needs DATABASE_URL.
 */
export const db = new Proxy({} as DB, {
  get(_target, prop) {
    const real = getDb();
    const value = Reflect.get(real as object, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
