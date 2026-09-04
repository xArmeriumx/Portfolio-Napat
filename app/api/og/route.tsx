import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";

const BRAND_BACKGROUND = "#0b0b0b";
const BRAND_ACCENT = "#c43c3c";

const KIND_LABELS = {
  site: "Portfolio",
  about: "About",
  projects: "Projects",
  project: "Case Study",
  notes: "Developer Notes",
  note: "Cheatsheet",
  contact: "Contact",
  search: "Site Search",
};

const DEFAULT_TITLE = "Napat Pamornsut — Web Developer & Software Tester";

async function loadPromptFonts() {
  const fontsDir = path.join(process.cwd(), "app", "api", "og", "fonts");
  const [regular, semiBold] = await Promise.all([
    readFile(path.join(fontsDir, "Prompt-Regular.ttf")),
    readFile(path.join(fontsDir, "Prompt-SemiBold.ttf")),
  ]);
  return [
    { name: "Prompt", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Prompt", data: semiBold, weight: 600 as const, style: "normal" as const },
  ];
}

function titleFontSize(title) {
  if (title.length <= 28) return 84;
  if (title.length <= 48) return 66;
  if (title.length <= 70) return 52;
  return 44;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind") || "site";
  const label = KIND_LABELS[kind] || KIND_LABELS.site;
  const title = (searchParams.get("title") || DEFAULT_TITLE).slice(0, 110);
  const subtitle = (searchParams.get("subtitle") || "").slice(0, 140);
  const fonts = await loadPromptFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: BRAND_BACKGROUND,
          padding: "72px 80px",
          fontFamily: "Prompt",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: `2px solid ${BRAND_ACCENT}`,
              color: "#f87171",
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: 6,
              textTransform: "uppercase",
              padding: "10px 24px",
              borderRadius: 10,
            }}
          >
            {label}
          </div>
          <div style={{ display: "flex", color: "#6b7280", fontSize: 26 }}>napatdev.com</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", width: 96, height: 10, backgroundColor: BRAND_ACCENT, borderRadius: 6 }} />
          <div
            style={{
              display: "flex",
              marginTop: 36,
              fontSize: titleFontSize(title),
              fontWeight: 600,
              lineHeight: 1.18,
              color: "#f9fafb",
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div style={{ display: "flex", marginTop: 28, fontSize: 30, color: "#9ca3af" }}>{subtitle}</div>
          ) : null}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 26, color: "#9ca3af" }}>
            Napat Pamornsut — Web Developer & Software Tester
          </div>
          <div style={{ display: "flex", width: 22, height: 22, backgroundColor: BRAND_ACCENT, borderRadius: 6 }} />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
      },
    },
  );
}
