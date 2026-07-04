import type { Metadata } from "next";
import About from "@/views/About.jsx";
import JsonLd from "@/components/utils/JsonLd";
import { getAboutPageSchema, getAboutSeoMeta } from "@/config/seo.js";
import { buildPageMetadata } from "@/lib/metadata";

const aboutSeo = getAboutSeoMeta();

export const metadata: Metadata = buildPageMetadata({
  title: aboutSeo.title,
  description: aboutSeo.description,
  ogTitle: aboutSeo.title,
  ogDescription: aboutSeo.description,
  ogImage: aboutSeo.ogImage,
  ogImageAlt: aboutSeo.ogImageAlt,
  ogImageWidth: 512,
  ogImageHeight: 512,
  path: aboutSeo.path,
});

export default function AboutPage() {
  return (
    <>
      <JsonLd data={getAboutPageSchema()} />
      <About />
    </>
  );
}
