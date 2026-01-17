import React from "react";

// Base URL for the portfolio
const BASE_URL = "https://napatdev.com";

/**
 * SEO Component - Uses React 19 Native Document Metadata key features
 * Renders <title>, <meta>, and <link> tags that are hoisted to the document <head>.
 *
 * @param {object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Meta description
 * @param {string} props.ogTitle - Open Graph title (optional)
 * @param {string} props.ogDescription - Open Graph description (optional)
 * @param {string} props.ogType - Open Graph type (optional, default: "website")
 * @param {string} props.ogImage - Open Graph image URL (optional)
 * @param {string} props.path - Path for canonical URL (optional, e.g., "/about")
 * @param {string} props.keywords - Additional keywords (optional)
 */
export default function SEO({
  title,
  description,
  ogTitle,
  ogDescription,
  ogType = "website",
  ogImage,
  path = "",
  keywords,
}) {
  const fullUrl = `${BASE_URL}${path}`;
  const imageUrl = ogImage || `${BASE_URL}/favicon.png`;
  const effectiveTitle = ogTitle || title;
  const effectiveDesc = ogDescription || description;

  return (
    <>
      {/* Primary Meta Tags */}
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={effectiveTitle} />
      <meta property="og:description" content={effectiveDesc} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content="Napatdev" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={effectiveTitle} />
      <meta name="twitter:description" content={effectiveDesc} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Canonical URL */}
      {/* Note: React 19 currently supports hoisting <title> and <meta>. 
          For <link> tags, it also supports them but key property helps prevent duplication. */}
      <link rel="canonical" href={fullUrl} />
    </>
  );
}
