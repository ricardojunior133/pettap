import { ImageResponse } from "next/og";

export const alt = "PetTap Coming Soon - Premium NFC Pet Tags";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default function OpenGraphImage(request: Request) {
  const tagImageUrl = new URL("/images/tag/black.png", request.url).toString();

  return new ImageResponse(
    (
      <div style={{ alignItems: "center", background: "#fbfbfa", color: "#111111", display: "flex", height: "100%", justifyContent: "space-between", overflow: "hidden", padding: "72px 92px", position: "relative", width: "100%" }}>
        <div style={{ background: "radial-gradient(circle, rgba(217,229,242,.8), transparent 64%)", height: "820px", position: "absolute", right: "-160px", top: "-140px", width: "820px" }} />
        <div style={{ display: "flex", flexDirection: "column", maxWidth: "630px", position: "relative" }}>
          <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.04em" }}>PetTap</div>
          <div style={{ color: "#525252", display: "flex", fontSize: 19, fontWeight: 600, letterSpacing: "0.12em", marginTop: "76px", textTransform: "uppercase" }}>Launching Soon</div>
          <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: "-0.07em", lineHeight: 1.02, marginTop: "20px" }}>Something special is coming.</div>
          <div style={{ color: "#525252", fontSize: 25, lineHeight: 1.35, marginTop: "28px" }}>Premium NFC Pet Tags designed to help pets find their way home.</div>
        </div>
        <div style={{ alignItems: "center", background: "rgba(255,255,255,.78)", border: "1px solid rgba(17,17,17,.06)", borderRadius: "42px", display: "flex", height: "420px", justifyContent: "center", position: "relative", width: "420px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse requires a standard image source. */}
          <img alt="" height="310" src={tagImageUrl} style={{ filter: "drop-shadow(0 24px 24px rgba(17,17,17,.23))", objectFit: "contain", width: "310px" }} width="310" />
        </div>
      </div>
    ),
    { ...size },
  );
}
