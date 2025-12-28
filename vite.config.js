import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ใช้ /Portfolio-Napat/ สำหรับ GitHub Pages, "/" สำหรับ Vercel
const base = process.env.GITHUB_PAGES ? "/Portfolio-Napat/" : "/";

export default defineConfig({
  plugins: [react()],
  base: base,
  build: {
    sourcemap: false, // ปิด SourceMap
    minify: 'esbuild', // ย่อโค้ดให้เล็กที่สุด
    chunkSizeWarningLimit: 1000,
  },
  esbuild: {
    drop: ['console', 'debugger'], // ลบ console.log และ debugger ทิ้งทั้งหมด
  },
});
