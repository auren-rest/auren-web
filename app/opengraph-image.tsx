import { ImageResponse } from "next/og";

export const alt = "Auren — n8n workflow automation and reliable software.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#050505", color: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 40, fontWeight: 600 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="1.5" /><path d="M12 2a10 10 0 0 0 0 20Z" fill="#fff" /></svg>
          Auren
        </div>
        <div style={{ fontSize: 96, fontWeight: 500, lineHeight: 1, letterSpacing: "-0.04em", maxWidth: 1000 }}>
          From Order to Execution. Automatically.
        </div>
      </div>
    ),
    size,
  );
}
