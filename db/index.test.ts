import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("db lazy connection", () => {
  it("imports without DATABASE_URL set", async () => {
    vi.stubEnv("DATABASE_URL", "");
    const mod = await import("./index");
    expect(mod.db).toBeDefined();
  });

  it("throws only when a query method is accessed without DATABASE_URL", async () => {
    vi.stubEnv("DATABASE_URL", "");
    const { db } = await import("./index");
    expect(() => db.select()).toThrow("DATABASE_URL is not set");
  });

  it("builds the client when DATABASE_URL is set", async () => {
    vi.stubEnv("DATABASE_URL", "postgres://user:pass@host/db");
    const { db } = await import("./index");
    // Accessing a query builder must not throw once the URL is present.
    expect(() => db.select()).not.toThrow();
  });
});
