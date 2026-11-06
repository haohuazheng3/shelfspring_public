import { ImageResponse } from "next/og";
import { LogoMark } from "@/components/site/Logo";

// This image has no Edge-specific dependencies; static output also keeps server errors observable.
export const runtime = "nodejs";
export const revalidate = false;
export const alt = "ShelfSpring — find your iPhone and catch the next restock";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "54px 64px", background: "#f5f4ee", color: "#193b31", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 34, fontWeight: 700, letterSpacing: -1 }}>
          <LogoMark size={54} />
          ShelfSpring
        </div>
        <div style={{ display: "flex", fontSize: 22, color: "#617066" }}>shelfspring.com</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 17 }}>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 76, fontWeight: 700, lineHeight: 1.04, letterSpacing: -3, maxWidth: 1000 }}>
          <div style={{ display: "flex" }}>Find your iPhone.</div>
          <div style={{ display: "flex" }}>Catch the next restock.</div>
        </div>
        <div style={{ display: "flex", fontSize: 27, color: "#475b51" }}>A clearer view of Apple Store pickup availability.</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "23px 30px", borderRadius: 22, background: "#153c32", color: "#f3f4c4", fontSize: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ display: "flex", width: 10, height: 10, borderRadius: 50, background: "#f3f4c4" }} />Live stock</div>
        <div style={{ display: "flex" }}>Restock patterns</div>
        <div style={{ display: "flex" }}>Pickup alerts</div>
      </div>
    </div>,
    size,
  );
}
