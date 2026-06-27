import {
  SITE_URL,
  SEO_DEFAULTS,
  absoluteUrl,
  toAbsoluteImageUrl,
  normalizeMetaDescription,
} from "../../config/seo.js";

/**
 * SEO Component - React 19 document metadata hoisting
 */
export default function SEO({
  title,
  description,
  ogTitle,
  ogDescription,
  ogType = "website",
  ogImage,
  ogImageAlt,
  ogImageWidth,
  ogImageHeight,
  path = "",
  keywords,
  noindex,
  structuredData,
  locale = SEO_DEFAULTS.locale,
  alternateLocale = SEO_DEFAULTS.alternateLocale,
}) {
  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : SITE_URL;

  const fullUrl = `${origin}${path}`;
  const canonicalUrl = absoluteUrl(path);
  const imageUrl = toAbsoluteImageUrl(ogImage || SEO_DEFAULTS.ogImage);
  const effectiveTitle = ogTitle || title;
  const effectiveDesc = normalizeMetaDescription(
    ogDescription || description,
    ogType === "article" ? 200 : 160,
  );
  const pageDescription = normalizeMetaDescription(description, 160);
  const effectiveKeywords = keywords || SEO_DEFAULTS.keywords;
  const effectiveImageAlt =
    ogImageAlt || `${effectiveTitle} — Napat Pamornsut Portfolio`;
  const isProjectImage = Boolean(ogImage && ogImage !== SEO_DEFAULTS.ogImage);
  const imageWidth = ogImageWidth || (isProjectImage ? 1200 : 512);
  const imageHeight = ogImageHeight || (isProjectImage ? 630 : 512);

  const schemas = Array.isArray(structuredData)
    ? structuredData
    : structuredData
      ? [structuredData]
      : [];

  return (
    <>
      {title && <title>{title}</title>}
      {title && <meta name="title" content={title} />}
      {pageDescription && <meta name="description" content={pageDescription} />}
      {effectiveKeywords && <meta name="keywords" content={effectiveKeywords} />}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large" />
      )}

      <meta name="author" content="Napat Pamornsut (ณภัทร ภมรสูตร)" />
      <meta name="geo.region" content="TH-10" />
      <meta name="geo.placename" content="Bangkok" />

      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={effectiveTitle} />
      <meta property="og:description" content={effectiveDesc} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:secure_url" content={imageUrl} />
      <meta property="og:image:alt" content={effectiveImageAlt} />
      <meta property="og:image:width" content={String(imageWidth)} />
      <meta property="og:image:height" content={String(imageHeight)} />
      <meta property="og:site_name" content="Napatdev" />
      <meta property="og:locale" content={locale} />
      <meta property="og:locale:alternate" content={alternateLocale} />

      {ogType === "article" && (
        <>
          <meta property="article:author" content="Napat Pamornsut" />
          <meta property="article:section" content="Portfolio Projects" />
        </>
      )}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={effectiveTitle} />
      <meta name="twitter:description" content={effectiveDesc} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={effectiveImageAlt} />

      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="en" href={canonicalUrl} />
      <link rel="alternate" hrefLang="th" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      {schemas.map((schema, index) => (
        <script key={`jsonld-${index}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </>
  );
}
