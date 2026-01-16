import { Link } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta.js";

export default function NotFound() {
  usePageMeta({
    title: "Page Not Found | Napat Pamornsut",
    description: "The page you are looking for does not exist.",
  });

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      {/* 404 Number */}
      <h1 className="font-sans text-[clamp(100px,15vw,200px)] font-bold text-gray-900 leading-none tracking-tighter opacity-10 select-none">
        404
      </h1>

      {/* Message Container */}
      <div className="-mt-8 md:-mt-12 relative z-10">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
          Page Not Found
        </h2>

        <div className="font-mono text-gray-500 text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">
          <p>&gt; The requested URL was not found on this server.</p>
          <p>&gt; Error_Code: 404_NOT_FOUND</p>
        </div>

        {/* Action Button */}
        <Link
          to="/"
          className="inline-block px-8 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-700 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-gray-200"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
