import { useEffect } from "react";

// Base URL for the portfolio (Vercel)
const BASE_URL = "https://napat-dev.com";

/**
 * usePageMeta - จัดการ SEO meta tags สำหรับแต่ละหน้า
 * รองรับ: Title, Description, Open Graph, Twitter Cards, Canonical URL
 * 
 * @param {object} options
 * @param {string} options.title - Page title
 * @param {string} options.description - Meta description
 * @param {string} options.ogTitle - Open Graph title (optional)
 * @param {string} options.ogDescription - Open Graph description (optional)
 * @param {string} options.ogType - Open Graph type (optional, default: "website")
 * @param {string} options.ogImage - Open Graph image URL (optional)
 * @param {string} options.path - Path for canonical URL (optional, e.g., "/about")
 * @param {string} options.keywords - Additional keywords (optional)
 */
export function usePageMeta({ 
  title, 
  description, 
  ogTitle, 
  ogDescription, 
  ogType = "website",
  ogImage,
  path = "",
  keywords
}) {
  useEffect(() => {
    // Set document title
    if (title) {
      document.title = title;
    }

    // Helper function to set/update meta tags
    const setMetaTag = (name, content, property = false) => {
      if (!content) return;
      
      const attr = property ? "property" : "name";
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // Helper function to set canonical link
    const setCanonicalLink = (url) => {
      if (!url) return;
      
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", url);
    };

    // Full URL for this page
    const fullUrl = `${BASE_URL}${path}`;
    const imageUrl = ogImage || `${BASE_URL}/favicon.png`;

    // Primary meta tags
    setMetaTag("description", description);
    setMetaTag("title", ogTitle || title);
    if (keywords) {
      setMetaTag("keywords", keywords);
    }

    // Open Graph meta tags
    setMetaTag("og:title", ogTitle || title, true);
    setMetaTag("og:description", ogDescription || description, true);
    setMetaTag("og:type", ogType, true);
    setMetaTag("og:url", fullUrl, true);
    setMetaTag("og:image", imageUrl, true);
    setMetaTag("og:site_name", "Napat Pamornsut (Napat-Dev)", true);
    setMetaTag("og:locale", "en_US", true);

    // Twitter Card meta tags
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", ogTitle || title);
    setMetaTag("twitter:description", ogDescription || description);
    setMetaTag("twitter:image", imageUrl);
    setMetaTag("twitter:url", fullUrl);

    // Canonical URL
    setCanonicalLink(fullUrl);

    // Cleanup: ไม่ต้อง cleanup เพราะหน้าถัดไปจะ set ค่าใหม่เอง
    return () => {};
  }, [title, description, ogTitle, ogDescription, ogType, ogImage, path, keywords]);
}
