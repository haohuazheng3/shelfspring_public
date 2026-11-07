import { ImageResponse } from "next/og";
import { LogoMark } from "@/components/site/Logo";

export const runtime = "nodejs";
export const revalidate = false;
export const alt = "ShelfSpring — your field guide to Apple pickup stock";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "46px 60px", background: "#f7f6f2", color: "#212936", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 28, borderBottom: "1px solid #c7cbd1" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 700, letterSpacing: -1 }}><LogoMark size={44} />ShelfSpring.</div>
        <div style={{ display: "flex", fontSize: 19, color: "#68717d" }}>shelfspring.com</div>
      </div>
      <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 55 }}>
        <div style={{ display: "flex", flexDirection: "column", width: 700, gap: 24 }}>
          <div style={{ display: "flex", color: "#2455d6", fontSize: 17, letterSpacing: 3 }}>THE PICKUP FIELD GUIDE</div>
          <div style={{ display: "flex", fontFamily: "serif", fontSize: 80, lineHeight: 1.03, letterSpacing: -3 }}>Less refreshing.<br />More possibility.</div>
          <div style={{ display: "flex", fontSize: 24, lineHeight: 1.4, color: "#4c5664" }}>Explore the stock. Read the patterns.<br />Know when your configuration returns.</div>
        </div>
        <div style={{ display: "flex", width: 275, flexDirection: "column", padding: "30px 26px", gap: 26, borderRadius: 24, background: "#fffefa", border: "1px solid #dcdfe3", boxShadow: "0 18px 35px -20px #8390a9" }}>
          {["Live availability", "Restock history", "Personal alerts"].map((label, index) => <div key={label} style={{ display: "flex", alignItems: "center", gap: 16, borderBottom: index < 2 ? "1px solid #e1e3e7" : "none", paddingBottom: index < 2 ? 26 : 0 }}><span style={{ display: "flex", color: "#2455d6", fontSize: 16 }}>0{index + 1}</span><span style={{ display: "flex", fontSize: 19 }}>{label}</span></div>)}
        </div>
      </div>
    </div>,
    size,
  );
}
