import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "../../context/LanguageContext";

/**
 * Breadcrumbs Component
 * Renders visual breadcrumbs and injects JSON-LD Structured Data
 */
export default function Breadcrumbs() {
  const location = useLocation();
  const { language } = useTranslation();

  // Don't show on home page
  if (location.pathname === "/") return null;

  const pathnames = location.pathname.split("/").filter((x) => x);
  const siteUrl = "https://napatdev.com";

  // Breadcrumb Schema items
  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: siteUrl,
    },
  ];

  let currentPath = "";

  // Generate items for schema
  pathnames.forEach((name, index) => {
    currentPath += `/${name}`;
    const isLast = index === pathnames.length - 1;

    // Format name (replace hyphens with spaces, capitalize)
    const formattedName = name
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    breadcrumbItems.push({
      "@type": "ListItem",
      position: index + 2,
      name: formattedName,
      item: `${siteUrl}${currentPath}`,
    });
  });

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  };

  return (
    <>
      {/* JSON-LD for Search Engines */}
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>

      {/* Visual Breadcrumbs (Optional - currently hidden/minimal, can be styled) */}
      {/* 
      <nav aria-label="breadcrumb" className="hidden">
        <ol>
          {breadcrumbItems.map((item, index) => (
            <li key={index}>
              <a href={item.item}>{item.name}</a>
            </li>
          ))}
        </ol>
      </nav> 
      */}
    </>
  );
}
