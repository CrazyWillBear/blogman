import { describe, expect, it } from "vitest";
import robots, { AI_TRAINING_BOTS } from "./robots";

describe("robots", () => {
  const result = robots();
  const rules = Array.isArray(result.rules) ? result.rules : [result.rules];

  it("lets general crawlers read everything but the admin editor", () => {
    const wildcard = rules.find((r) => r.userAgent === "*");
    expect(wildcard).toBeDefined();
    expect(wildcard?.allow).toBe("/");
    expect(wildcard?.disallow).toBe("/admin");
  });

  it("blocks every known LLM-training crawler from the whole site", () => {
    for (const bot of AI_TRAINING_BOTS) {
      const rule = rules.find((r) => r.userAgent === bot);
      expect(rule, `missing rule for ${bot}`).toBeDefined();
      expect(rule?.disallow).toBe("/");
    }
  });

  it("does not accidentally allow a training bot anywhere", () => {
    for (const bot of AI_TRAINING_BOTS) {
      const rule = rules.find((r) => r.userAgent === bot);
      expect(rule?.allow).toBeUndefined();
    }
  });

  it("points crawlers at the sitemap", () => {
    expect(result.sitemap).toMatch(/\/sitemap\.xml$/);
  });
});
