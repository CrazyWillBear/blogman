/** Quiet glyph marking a pinned post, tuned to the faint tertiary tone. */
export function PinMark() {
  return (
    <span
      aria-label="Pinned"
      title="Pinned"
      className="text-faint"
      style={{ fontSize: "13px", lineHeight: 1 }}
    >
      ✦
    </span>
  );
}
