import { describe, expect, it } from "vitest";
import { isAllowedLogin, parseAllowlist } from "./allowlist";

describe("parseAllowlist", () => {
  it("splits, trims, and lowercases", () => {
    expect(parseAllowlist(" CrazyWillBear , other ")).toEqual([
      "crazywillbear",
      "other",
    ]);
  });

  it("handles unset and empty values", () => {
    expect(parseAllowlist(undefined)).toEqual([]);
    expect(parseAllowlist("")).toEqual([]);
    expect(parseAllowlist(" , ,")).toEqual([]);
  });
});

describe("isAllowedLogin", () => {
  const allowlist = parseAllowlist("CrazyWillBear");

  it("matches case-insensitively", () => {
    expect(isAllowedLogin("crazywillbear", allowlist)).toBe(true);
    expect(isAllowedLogin("CrazyWillBear", allowlist)).toBe(true);
  });

  it("rejects unknown and missing logins", () => {
    expect(isAllowedLogin("intruder", allowlist)).toBe(false);
    expect(isAllowedLogin(undefined, allowlist)).toBe(false);
  });

  it("rejects everyone when the allowlist is empty", () => {
    expect(isAllowedLogin("crazywillbear", [])).toBe(false);
  });
});
