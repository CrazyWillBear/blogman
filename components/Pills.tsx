/**
 * Small uppercase chrome for the homepage index: tag pills and the pinned
 * marker. Two sizes/variants keep the ruled list quiet while letting the
 * featured hero card read a touch louder.
 */

const tagBase: React.CSSProperties = {
  color: "#a85636",
  letterSpacing: ".04em",
  textTransform: "uppercase",
  borderRadius: "999px",
};

/** A single tag. `sm` for ruled rows, `md` for the featured card. */
export function TagPill({
  label,
  size = "sm",
}: {
  label: string;
  size?: "sm" | "md";
}) {
  const sized: React.CSSProperties =
    size === "md"
      ? { background: "#ecd8bd", fontSize: "11px", padding: "3px 10px" }
      : { background: "var(--paper-shade)", fontSize: "10px", padding: "3px 9px" };
  return <span style={{ ...tagBase, ...sized }}>{label}</span>;
}

/**
 * The "✦ Pinned" marker. `tag` is the inline pill that sits in a row's tag
 * line; `badge` is the larger label that overhangs the featured card's corner.
 */
export function PinnedPill({ variant = "tag" }: { variant?: "tag" | "badge" }) {
  const style: React.CSSProperties =
    variant === "badge"
      ? {
          position: "absolute",
          top: "-13px",
          left: "24px",
          fontSize: "11px",
          letterSpacing: ".14em",
          padding: "5px 12px",
          borderRadius: "7px",
          boxShadow: "0 4px 12px -4px rgba(58,48,38,.45)",
        }
      : {
          fontSize: "10px",
          letterSpacing: ".05em",
          padding: "3px 9px",
          borderRadius: "999px",
        };
  return (
    <span
      style={{
        background: "var(--accent)",
        color: "#fbf3e7",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      ✦ Pinned
    </span>
  );
}
