import type { Metadata } from "next";
import SiteNotFound from "../(site)/not-found";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "ไม่พบหน้านี้",
  description: "ไม่พบหน้าที่ค้นหาบน Napatdev พอร์ตโฟลิโอของ Napat Pamornsut (ณภัทร ภมรสูตร)",
  path: "/th/404",
  noindex: true,
  locale: "th",
  keywords: ["Napatdev 404", "Napat Pamornsut", "ณภัทร ภมรสูตร"],
});

export default SiteNotFound;
