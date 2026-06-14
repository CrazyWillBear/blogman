import { describe, expect, it } from "vitest";
import { formatKicker, isVerse, postKind } from "./kicker";

describe("isVerse", () => {
  it("detects 'poem' and 'poetry' case-insensitively", () => {
    expect(isVerse(["poem"])).toBe(true);
    expect(isVerse(["POETRY"])).toBe(true);
    expect(isVerse(["Poem"])).toBe(true);
    expect(isVerse(["Poetry"])).toBe(true);
  });

  it("ignores surrounding whitespace on tags", () => {
    expect(isVerse(["  poem  "])).toBe(true);
  });

  it("is true when any tag is a verse tag among others", () => {
    expect(isVerse(["nature", "poem", "spring"])).toBe(true);
  });

  it("is false for non-verse tags and partial matches", () => {
    expect(isVerse([])).toBe(false);
    expect(isVerse(["essay", "nature"])).toBe(false);
    expect(isVerse(["poems"])).toBe(false);
    expect(isVerse(["a poem"])).toBe(false);
  });
});

describe("postKind", () => {
  it("returns 'Poem' for verse tags", () => {
    expect(postKind(["poetry"])).toBe("Poem");
  });

  it("returns 'Essay' otherwise", () => {
    expect(postKind([])).toBe("Essay");
    expect(postKind(["nature"])).toBe("Essay");
  });
});

describe("formatKicker", () => {
  it("returns the bare kind when number is undefined", () => {
    expect(formatKicker([])).toBe("Essay");
    expect(formatKicker(["poem"])).toBe("Poem");
    expect(formatKicker(["nature"], undefined)).toBe("Essay");
  });

  it("appends a zero-padded number when one is supplied", () => {
    expect(formatKicker([], 3)).toBe("Essay № 03");
    expect(formatKicker(["poem"], 1)).toBe("Poem № 01");
  });

  it("does not pad numbers that are already two or more digits", () => {
    expect(formatKicker([], 12)).toBe("Essay № 12");
    expect(formatKicker([], 100)).toBe("Essay № 100");
  });

  it("treats a zero number as present, not undefined", () => {
    expect(formatKicker([], 0)).toBe("Essay № 00");
  });
});
