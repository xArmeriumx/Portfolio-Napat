import type { NextConfig } from "next";

const legacyNoteRedirects = [
  { source: "/notes/NEXTJS_ARCHITECTURE", destination: "/notes/nextjs-app-router-guide" },
  { source: "/notes/TYPESCRIPT_REFERENCE", destination: "/notes/typescript-reference-guide" },
  { source: "/notes/sql_basics_with_examples_easy", destination: "/notes/sql-basics" },
  { source: "/notes/sql_code_and_response_tables", destination: "/notes/sql-query-examples" },
];

const noIndexHeaders = [
  "/admin/:path*",
  "/preview/:path*",
  "/api/admin/:path*",
  "/api/auth/:path*",
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
  async redirects() {
    return [
      ...legacyNoteRedirects.map((redirect) => ({ ...redirect, permanent: true })),
      ...legacyNoteRedirects.map((redirect) => ({
        source: `/th${redirect.source}`,
        destination: `/th${redirect.destination}`,
        permanent: true,
      })),
    ];
  },
  async headers() {
    return noIndexHeaders.map((source) => ({
      source,
      headers: [
        {
          key: "X-Robots-Tag",
          value: "noindex, nofollow, noarchive",
        },
      ],
    }));
  },
};

export default nextConfig;
