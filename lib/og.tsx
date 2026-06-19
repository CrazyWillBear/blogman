import { ImageResponse } from "next/og";
import { ogTitleSize } from "./og-fields";

/**
 * Shared, db-free Open Graph card renderer. Mirrors the live header chrome on
 * the Hearth paper background: a hairline + kicker/tags row, the headline, a
 * byline, a heavy ink rule, and the W monogram + domain stamp pinned to the
 * foot. Takes only plain strings — no client/db imports — so any route's
 * `opengraph-image` handler can drive it.
 */

// Hearth palette (see app/globals.css).
const PAPER = "#f7eee2";
const INK = "#3a302a";
const MUTED = "#857669";
const FAINT = "#a99c8a";
const ACCENT = "#bd6240";
const KICKER = "#9c6b2e";
const HAIRLINE = "#d8c39a";

type OgCardProps =
  | { variant: "home"; title: string; tagline: string; domain: string }
  | {
      variant: "post";
      kicker: string;
      title: string;
      tags: string;
      byline: string;
      domain: string;
    };

/**
 * Fetch a Crimson Pro weight as a .ttf at render time via the Google Fonts
 * CSS2 API. A pre-woff2 desktop User-Agent coaxes a .ttf (not woff2) out of the
 * API — satori can't parse woff2; we regex the url from the returned CSS and
 * fetch it. Returns null on any failure so the card still renders (next/og
 * falls back to a default serif).
 */
async function loadCrimsonPro(weight: 400 | 600): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@${weight}`;
    const cssResponse = await fetch(cssUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.30",
      },
    });
    const css = await cssResponse.text();
    const match = css.match(/src:\s*url\((https:\/\/[^)]+\.ttf)\)/);
    if (!match) return null;
    const fontResponse = await fetch(match[1]);
    return await fontResponse.arrayBuffer();
  } catch {
    return null;
  }
}

/** The brand mark: a terracotta rounded square with a cream serif "W". */
function monogram(size: number) {
  return (
    <div
      style={{
        display: "flex",
        width: size,
        height: size,
        borderRadius: size * 0.22,
        backgroundColor: ACCENT,
        alignItems: "center",
        justifyContent: "center",
        color: PAPER,
        fontSize: size * 0.6,
        fontWeight: 600,
      }}
    >
      W
    </div>
  );
}

/** Per-post body: the post header, faithfully — kicker/tags + mark up top,
 *  domain stamp at foot. */
function postBody(p: Extract<OgCardProps, { variant: "post" }>) {
  return [
    <div key="head" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", width: "100%", height: 1, backgroundColor: HAIRLINE }} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            textTransform: "uppercase",
            letterSpacing: "0.16em",
          }}
        >
          <div style={{ display: "flex", fontSize: 30, color: KICKER, fontWeight: 600 }}>
            {p.kicker}
          </div>
          {p.tags && (
            <div style={{ display: "flex", marginTop: 10, fontSize: 26, color: FAINT }}>
              {p.tags}
            </div>
          )}
        </div>
        {monogram(96)}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 28,
          fontSize: ogTitleSize(p.title),
          fontWeight: 600,
          lineHeight: 1.05,
          letterSpacing: "-0.01em",
          color: INK,
        }}
      >
        {p.title}
      </div>
      <div style={{ display: "flex", marginTop: 40, fontSize: 32, color: MUTED }}>
        {p.byline}
      </div>
      <div style={{ display: "flex", width: "100%", height: 2, backgroundColor: INK, marginTop: 24 }} />
    </div>,
    <div key="foot" style={{ display: "flex", fontSize: 22, color: MUTED }}>
      {p.domain}
    </div>,
  ];
}

/** Home body: short accent rule + prominent mark up top, then name, tagline;
 *  domain at foot. */
function homeBody(p: Extract<OgCardProps, { variant: "home" }>) {
  return [
    <div key="head" style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", width: 64, height: 3, backgroundColor: ACCENT }} />
        {monogram(108)}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 40,
          fontSize: ogTitleSize(p.title),
          fontWeight: 600,
          lineHeight: 1.05,
          letterSpacing: "-0.01em",
          color: INK,
        }}
      >
        {p.title}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 24,
          maxWidth: 820,
          fontSize: 34,
          lineHeight: 1.4,
          color: MUTED,
        }}
      >
        {p.tagline}
      </div>
    </div>,
    <div key="foot" style={{ display: "flex", fontSize: 22, color: MUTED }}>
      {p.domain}
    </div>,
  ];
}

export async function ogCard(props: OgCardProps): Promise<ImageResponse> {
  const [w400, w600] = await Promise.all([
    loadCrimsonPro(400),
    loadCrimsonPro(600),
  ]);
  const fonts = (
    [
      w400 && { name: "Crimson Pro", data: w400, weight: 400 as const, style: "normal" as const },
      w600 && { name: "Crimson Pro", data: w600, weight: 600 as const, style: "normal" as const },
    ] as const
  ).filter(Boolean) as {
    name: string;
    data: ArrayBuffer;
    weight: 400 | 600;
    style: "normal";
  }[];

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "72px",
          backgroundColor: PAPER,
          fontFamily: fonts.length ? "Crimson Pro" : "serif",
        }}
      >
        {props.variant === "home" ? homeBody(props) : postBody(props)}
      </div>
    ),
    {
      width: 1200,
      height: 630,
      ...(fonts.length ? { fonts } : {}),
    },
  );
}
