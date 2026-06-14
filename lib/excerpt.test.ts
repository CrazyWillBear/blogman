import { describe, expect, it } from "vitest";
import { excerpt } from "./excerpt";

describe("excerpt", () => {
  it("returns an empty string for empty or whitespace input", () => {
    expect(excerpt("")).toBe("");
    expect(excerpt("   \n\t  ")).toBe("");
  });

  it("returns short plain prose unchanged, without an ellipsis", () => {
    expect(excerpt("A quiet walk through the forest.")).toBe(
      "A quiet walk through the forest.",
    );
  });

  it("strips link syntax but keeps the link text", () => {
    expect(excerpt("See [the post](https://example.com/x) for more.")).toBe(
      "See the post for more.",
    );
  });

  it("drops images entirely", () => {
    expect(excerpt("Look ![alt text](https://example.com/pic.png) here.")).toBe(
      "Look here.",
    );
  });

  it("removes bold and emphasis markers", () => {
    expect(excerpt("This is **very** _important_ and __strong__ too.")).toBe(
      "This is very important and strong too.",
    );
  });

  it("drops a leading title heading but keeps later section headings", () => {
    expect(excerpt("# Title\n\nBody text follows.")).toBe("Body text follows.");
    expect(excerpt("Intro line.\n\n## Section\n\nMore.")).toBe(
      "Intro line. Section More.",
    );
  });

  it("strips fenced and inline code", () => {
    expect(
      excerpt("Before\n\n```js\nconst x = 1;\n```\n\nuse `npm run` after."),
    ).toBe("Before use npm run after.");
  });

  it("strips blockquote and list markers", () => {
    expect(excerpt("> a wise quote")).toBe("a wise quote");
    expect(excerpt("- first\n- second\n- third")).toBe("first second third");
    expect(excerpt("1. one\n2. two")).toBe("one two");
  });

  it("strips html tags including <br>", () => {
    expect(excerpt("Line one<br>line two<span>three</span>")).toBe(
      "Line one line two three",
    );
  });

  it("collapses newlines and runs of whitespace into single spaces", () => {
    expect(excerpt("one\n\n\ntwo    three\tfour")).toBe("one two three four");
  });

  it("truncates on a word boundary and appends a real ellipsis", () => {
    const text =
      "The quick brown fox jumps over the lazy dog while the sun sets.";
    const result = excerpt(text, 20);
    expect(result).toBe("The quick brown fox…");
    expect(result.length).toBeLessThanOrEqual(21); // 20 chars + the ellipsis
    expect(result.endsWith("…")).toBe(true);
  });

  it("does not append an ellipsis when the text fits exactly", () => {
    const text = "Exactly twenty chars";
    expect(text.length).toBe(20);
    expect(excerpt(text, 20)).toBe(text);
    expect(excerpt(text, 20).endsWith("…")).toBe(false);
  });

  it("honours a custom maxLen, defaulting to 160", () => {
    const long = "word ".repeat(60).trim(); // 299 chars
    expect(excerpt(long).length).toBeLessThanOrEqual(161);
    expect(excerpt(long).endsWith("…")).toBe(true);
  });
});
