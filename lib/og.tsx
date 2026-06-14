import { ImageResponse } from "next/og";

/**
 * Shared, db-free Open Graph card renderer. Mirrors the post header on the
 * light paper background. Takes only plain strings — no client/db imports — so
 * it can be driven from any route's `opengraph-image` handler.
 */

// Hearth palette (see app/globals.css).
const PAPER = "#f7eee2";
const INK = "#3a302a";
const MUTED = "#857669";
const ACCENT = "#bd6240";
const KICKER = "#9c6b2e";

/**
 * Fetch the Crimson Pro 600 .ttf at render time via the Google Fonts CSS2 API.
 * A desktop User-Agent coaxes a .ttf (not woff2) out of the API; we regex the
 * url from the returned CSS and fetch it as an arrayBuffer. Returns null on any
 * failure so the card still renders (next/og falls back to a default font).
 */
async function loadCrimsonPro(): Promise<ArrayBuffer | null> {
  try {
    const cssUrl =
      "https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@600";
    const cssResponse = await fetch(cssUrl, {
      headers: {
        // Pre-woff2 UA → the API serves a .ttf src (satori can't parse woff2).
        // Modern UAs get woff2-only CSS, which would force the serif fallback.
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

export async function ogCard({
  kicker,
  title,
  siteName,
}: {
  kicker?: string;
  title: string;
  siteName: string;
}): Promise<ImageResponse> {
  const fontData = await loadCrimsonPro();
  const fonts = fontData
    ? [{ name: "Crimson Pro", data: fontData, weight: 600 as const, style: "normal" as const }]
    : undefined;

  // Clamp the title size so long headlines stay on the card.
  const titleSize = title.length > 48 ? 64 : 72;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "80px",
          backgroundColor: PAPER,
          fontFamily: fontData ? "Crimson Pro" : "serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "3px",
            backgroundColor: ACCENT,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          {kicker !== undefined && (
            <div
              style={{
                display: "flex",
                fontSize: "26px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: KICKER,
                marginBottom: "28px",
              }}
            >
              {kicker}
            </div>
          )}
          <div
            style={{
              display: "flex",
              fontSize: `${titleSize}px`,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
              color: INK,
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "28px",
            color: MUTED,
          }}
        >
          {siteName}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      ...(fonts ? { fonts } : {}),
    },
  );
}
