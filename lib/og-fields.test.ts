import { describe, expect, it } from "vitest";
import { formatDate } from "./format";
import { ogByline, ogTags, ogTitleSize } from "./og-fields";

describe("ogTitleSize", () => {
  it("uses the largest size for short titles", () => {
    expect(ogTitleSize("Hearth")).toBe(88);
    expect(ogTitleSize("x".repeat(30))).toBe(88); // boundary
  });

  it("steps down once past 30 characters", () => {
    expect(ogTitleSize("x".repeat(31))).toBe(76);
    expect(ogTitleSize("x".repeat(48))).toBe(76); // boundary
  });

  it("steps down again past 48 characters", () => {
    expect(ogTitleSize("x".repeat(49))).toBe(64);
    expect(ogTitleSize("x".repeat(72))).toBe(64); // boundary
  });

  it("uses the smallest size for very long titles", () => {
    expect(ogTitleSize("x".repeat(73))).toBe(54);
    expect(ogTitleSize("x".repeat(200))).toBe(54);
  });
});

describe("ogTags", () => {
  it("joins tags with a middot", () => {
    expect(ogTags(["ai", "llms"])).toBe("ai · llms");
  });

  it("keeps only the first three tags", () => {
    expect(ogTags(["ai", "llms", "ethics", "essay"])).toBe("ai · llms · ethics");
  });

  it("returns an empty string for no tags", () => {
    expect(ogTags([])).toBe("");
  });
});

describe("ogByline", () => {
  const created = new Date(2026, 5, 14); // June 14, 2026 (local)

  it("renders author and published date", () => {
    expect(ogByline("William Chastain", created, created)).toBe(
      `By William Chastain · ${formatDate(created)}`,
    );
  });

  it("appends the updated date when the post was edited", () => {
    const updated = new Date(2026, 5, 20);
    expect(ogByline("William Chastain", created, updated)).toBe(
      `By William Chastain · ${formatDate(created)} · updated ${formatDate(updated)}`,
    );
  });

  it("does not append 'updated' when the timestamps match", () => {
    expect(ogByline("Ada", created, new Date(2026, 5, 14))).not.toContain(
      "updated",
    );
  });
});
