import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Napat Pamornsut (ณภัทร ภมรสูตร) | Napatdev",
    short_name: "Napatdev",
    description:
      "Web Developer and Software Tester based in Bangkok, Thailand. Portfolio of React, Next.js, Node.js, Playwright projects, and technical notes. พอร์ตโฟลิโอของ ณภัทร ภมรสูตร รวมโปรเจคและโน้ตความรู้ด้านเทคนิค",
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
