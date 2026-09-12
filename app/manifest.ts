import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Napatdev — Napat Pamornsut (ณภัทร ภมรสูตร)",
    short_name: "Napatdev",
    description:
      "Napatdev portfolio of Napat Pamornsut (ณภัทร ภมรสูตร), a Web Developer and Software Tester in Bangkok, with Next.js, TypeScript, QA automation projects, and technical notes.",
    start_url: "/",
    id: "/",
    lang: "en",
    dir: "ltr",
    display: "standalone",
    background_color: "#0b0b0b",
    theme_color: "#0b0b0b",
    orientation: "portrait-primary",
    categories: ["portfolio", "developer", "productivity"],
    icons: [
      {
        src: "/icon.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
