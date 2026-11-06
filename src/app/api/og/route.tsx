import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get("title") || "Ishan Jarwal's Blog";
    const tag = searchParams.get("tag") || "Engineering";
    const readTime = searchParams.get("readTime") || "5 min read";
    const description =
      searchParams.get("description") ||
      "Systems, Distributed Architecture & Agentic AI Engineering";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#010409",
            color: "#e6edf3",
            fontFamily: "monospace",
            padding: "56px 64px",
            border: "2px solid #30363d",
            boxSizing: "border-box",
          }}
        >
          {/* Top header navigation */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              borderBottom: "1px solid #30363d",
              paddingBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "24px",
                fontWeight: 700,
                color: "#58a6ff",
              }}
            >
              <span>~/ ishanjarwal / blog</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#161b22",
                border: "1px solid #30363d",
                padding: "6px 16px",
                fontSize: "18px",
                color: "#7ee787",
                fontWeight: 600,
              }}
            >
              <span>[ #{tag} ]</span>
            </div>
          </div>

          {/* Center Main Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              marginTop: "24px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                fontSize: title.length > 60 ? "46px" : "56px",
                fontWeight: 900,
                color: "#f0f6fc",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                display: "-webkit-box",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: "22px",
                color: "#8b949e",
                lineHeight: 1.4,
                display: "-webkit-box",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {description}
            </div>
          </div>

          {/* Footer Metadata */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              borderTop: "1px solid #30363d",
              paddingTop: "24px",
              fontSize: "20px",
              color: "#8b949e",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "#f0f6fc",
                fontWeight: 600,
              }}
            >
              <span>By Ishan Jarwal</span>
              <span style={{ color: "#30363d" }}>•</span>
              <span style={{ color: "#8b949e" }}>{readTime}</span>
            </div>
            <div
              style={{
                display: "flex",
                color: "#58a6ff",
                fontWeight: 600,
              }}
            >
              <span>blog.myportfolio.com</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("OpenGraph image generation failed:", error);
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
