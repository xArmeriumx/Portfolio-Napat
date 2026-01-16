/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // From theme.css (Dark mode foundations if needed)
        "theme-bg": "#0b0b0d",
        "theme-text": "rgba(255,255,255,0.92)",
        "theme-muted": "rgba(255,255,255,0.65)",
        "theme-line": "rgba(255,255,255,0.10)",
        "theme-accent": "#f5c542",

        // From globals.css (Actual used Light mode)
        "app-bg": "#f5f5f7",
        "app-text": "#1d1d1f",
        "app-muted": "#6e6e73",
        "app-red": "#d14d4d",
      },
      fontFamily: {
        sans: [
          "Prompt",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Arial",
          "sans-serif",
        ],
      },
      maxWidth: {
        site: "1100px",
      },
    },
  },
  plugins: [],
};
