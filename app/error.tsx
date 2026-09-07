"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold text-gray-900 md:text-4xl">Something went wrong</h1>
      <p className="mb-8 mt-4 max-w-md text-sm leading-relaxed text-gray-500 md:text-base">
        The page failed to load. Please try again or return home.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-gray-900 px-8 py-3 font-medium text-white transition-all hover:bg-gray-700"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-gray-300 px-8 py-3 font-medium text-gray-900 transition-all hover:border-gray-500"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
