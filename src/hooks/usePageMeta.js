import { useEffect } from "react";

/**
 * usePageMeta - จัดการ SEO meta tags สำหรับแต่ละหน้า
 * @param {object} options
 * @param {string} options.title - Page title
 * @param {string} options.description - Meta description
 * @param {string} options.ogTitle - Open Graph title (optional)
 * @param {string} options.ogDescription - Open Graph description (optional)
 * @param {string} options.ogType - Open Graph type (optional, default: "website")
 */
export function usePageMeta({ title, description, ogTitle, ogDescription, ogType = "website" }) {
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

    // Set meta tags
    setMetaTag("description", description);
    setMetaTag("og:title", ogTitle || title, true);
    setMetaTag("og:description", ogDescription || description, true);
    setMetaTag("og:type", ogType, true);

    // Cleanup: restore default title on unmount (optional)
    return () => {
      // ไม่ต้อง cleanup เพราะหน้าถัดไปจะ set ค่าใหม่เอง
    };
  }, [title, description, ogTitle, ogDescription, ogType]);
}
