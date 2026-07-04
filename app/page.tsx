import type { Metadata } from "next";
import Home from "@/views/Home.jsx";
import JsonLd from "@/components/utils/JsonLd";
import { SEO_DEFAULTS, getHomeGraphSchema } from "@/config/seo.js";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: SEO_DEFAULTS.title,
  description: SEO_DEFAULTS.description,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={getHomeGraphSchema()} />
      <Home />
    </>
  );
}
