import Link from "next/link";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Page Not Found | Napatdev",
  description: "The requested page was not found on Napatdev, the portfolio of Napat Pamornsut (ณภัทร ภมรสูตร).",
  path: "/404",
  noindex: true,
  keywords: ["Napatdev 404", "Napat Pamornsut", "ณภัทร ภมรสูตร"],
});

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="font-sans text-[clamp(100px,15vw,200px)] font-bold text-gray-900 leading-none tracking-tighter opacity-10 select-none">
        404
      </h1>
      <div className="-mt-8 md:-mt-12 relative z-10">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
          Page Not Found
        </h2>
        <div className="font-mono text-gray-500 text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">
          <p>&gt; The requested URL was not found on this server.</p>
          <p>&gt; Error_Code: 404_NOT_FOUND</p>
        </div>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-700 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-gray-200"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
