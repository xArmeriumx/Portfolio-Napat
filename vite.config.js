import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ใช้ /Portfolio-Napat/ สำหรับ GitHub Pages, "/" สำหรับ Vercel
const base = process.env.GITHUB_PAGES ? "/Portfolio-Napat/" : "/";

export default defineConfig({
  plugins: [react()],
  base: base,
});
