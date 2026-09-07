import { Prompt, Space_Grotesk, Space_Mono } from "next/font/google";

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const prompt = Prompt({
  subsets: ["latin", "thai"],
  variable: "--font-prompt",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
  display: "swap",
});

export const fontVariables = `${spaceGrotesk.variable} ${prompt.variable} ${spaceMono.variable}`;
