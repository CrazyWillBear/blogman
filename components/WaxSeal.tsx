/** Wax-seal ornament marking a pinned post. */
export function WaxSeal() {
  return (
    <span
      title="Pinned"
      aria-label="Pinned"
      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-oxblood text-[0.65rem] font-semibold text-parchment shadow-[inset_0_1px_2px_rgba(232,220,196,0.35),inset_0_-2px_3px_rgba(0,0,0,0.45),0_1px_3px_rgba(0,0,0,0.6)]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 35% 30%, rgba(232,220,196,0.25), transparent 45%)",
      }}
    >
      ✦
    </span>
  );
}
