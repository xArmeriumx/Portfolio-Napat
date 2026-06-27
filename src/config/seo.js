import { profile } from "../data/profile.js";

export const SITE_URL = "https://napatdev.com";
export const SITE_NAME = "Napatdev";

export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

const skillNames = profile.skillCategories.flatMap((cat) =>
  cat.skills.map((s) => s.name),
);

export const SEO_DEFAULTS = {
  title: `${profile.name} (ณภัทร ภมรสูตร) | Web Developer & Software Tester`,
  description: `${profile.tagline} Based in ${profile.contact.location}. Portfolio of web development and software testing projects using React, Next.js, Node.js, Playwright, and more.`,
  keywords: [
    profile.name,
    "ณภัทร ภมรสูตร",
    "Napatdev",
    "Napat Dev",
    "Web Developer",
    "Software Tester",
    "QA Engineer",
    "React Developer",
    "Next.js Developer",
    "Node.js",
    "Playwright",
    "Automation Testing",
    "Bangkok",
    "Thailand",
    "Portfolio",
    ...skillNames,
  ].join(", "),
  ogImage: `${SITE_URL}/favicon.png`,
  locale: "en_US",
  alternateLocale: "th_TH",
};

export function absoluteUrl(path = "") {
  if (!path) return `${SITE_URL}/`;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function toAbsoluteImageUrl(image) {
  if (!image) return SEO_DEFAULTS.ogImage;
  if (image.startsWith("http")) return image;
  const normalized = image.startsWith("/") ? image : `/${image}`;
  return `${SITE_URL}${normalized}`;
}

export function normalizeMetaDescription(text, maxLength = 160) {
  if (!text) return "";
  const cleaned = String(text).replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength - 3).trimEnd()}...`;
}

export function getAboutSeoMeta() {
  return {
    title: `${profile.name} (ณภัทร ภมรสูตร) | About`,
    description: normalizeMetaDescription(
      `About ${profile.name} (ณภัทร ภมรสูตร) — ${profile.headline}. ${profile.about} Based in ${profile.contact.location}. Skills include React, Next.js, Node.js, Playwright, and more.`,
      300,
    ),
    ogImage: "/favicon.png",
    ogImageAlt: `${profile.name} — Web Developer & Software Tester`,
    path: "/about",
    keywords: [
      profile.name,
      "ณภัทร ภมรสูตร",
      "About Napat Pamornsut",
      "Web Developer Bangkok",
      "Software Tester Thailand",
      "Napatdev",
      ...skillNames.slice(0, 12),
    ].join(", "),
  };
}

export function getProjectSeoMeta(project, getContent) {
  const title = getContent(project, "title");
  const description = normalizeMetaDescription(getContent(project, "description"), 300);
  const image = project.images?.[0] || project.image || SEO_DEFAULTS.ogImage;
  const technologies = (project.technologies || []).slice(0, 6).join(", ");

  return {
    title: `${title} | Projects — ${profile.name}`,
    description,
    ogTitle: `${title} | Napat Pamornsut`,
    ogDescription: normalizeMetaDescription(
      `${description}${technologies ? ` Tech: ${technologies}.` : ""}`,
      200,
    ),
    ogImage: image,
    ogImageAlt: `${title} — portfolio project by ${profile.name}`,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    path: `/projects/${project.slug}`,
    keywords: [
      title,
      profile.name,
      "ณภัทร ภมรสูตร",
      "Portfolio Project",
      ...(project.technologies || []),
      ...(project.role || []),
    ].join(", "),
  };
}

export function getProjectsListSeoMeta() {
  return {
    title: `Projects | ${profile.name} (ณภัทร ภมรสูตร)`,
    description:
      "Explore portfolio projects by Napat Pamornsut — web development, ERP/POS systems, IoT dashboards, automation testing, and UX/UI design.",
    ogImage: "/images/shop-inventory-1.png",
    ogImageAlt: "Napat Pamornsut portfolio projects",
    path: "/projects",
  };
}

export function getSameAsLinks() {
  return [profile.links.github, profile.links.linkedin].filter(
    (url) => url && url !== "#",
  );
}

export function getPersonSchema(overrides = {}) {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: profile.name,
    alternateName: ["ณภัทร ภมรสูตร", "Napat Dev", "napatdev"],
    url: `${SITE_URL}/`,
    image: SEO_DEFAULTS.ogImage,
    jobTitle: profile.headline.split(" | "),
    description: profile.about,
    email: profile.links.email,
    nationality: {
      "@type": "Country",
      name: "Thailand",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bangkok",
      addressRegion: "Bangkok",
      addressCountry: "TH",
    },
    workLocation: {
      "@type": "Place",
      name: profile.contact.location,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bangkok",
        addressCountry: "TH",
      },
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: profile.education[0],
      department: profile.education[1],
    },
    knowsAbout: skillNames,
    hasOccupation: [
      {
        "@type": "Occupation",
        name: "Web Developer",
        occupationalCategory: "15-1254.00",
        skills: skillNames.join(", "),
      },
      {
        "@type": "Occupation",
        name: "Software Tester",
        occupationalCategory: "15-1253.00",
        skills: "Playwright, Automation Testing, QA, UAT",
      },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "professional inquiries",
      email: profile.links.email,
      areaServed: "TH",
      availableLanguage: ["English", "Thai"],
    },
    sameAs: getSameAsLinks(),
    ...overrides,
  };
}

export function getOrganizationSchema(overrides = {}) {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    alternateName: [`${profile.name} Portfolio`, "Napat Dev"],
    url: `${SITE_URL}/`,
    logo: {
      "@type": "ImageObject",
      url: SEO_DEFAULTS.ogImage,
      width: 512,
      height: 512,
    },
    founder: { "@id": PERSON_ID },
    sameAs: getSameAsLinks(),
    ...overrides,
  };
}

export function getWebSiteSchema(overrides = {}) {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: `${profile.name} | ${SITE_NAME}`,
    alternateName: ["ณภัทร ภมรสูตร", "Napat Dev", "napatdev"],
    url: `${SITE_URL}/`,
    description: SEO_DEFAULTS.description,
    inLanguage: ["en", "th"],
    publisher: { "@id": ORGANIZATION_ID },
    author: { "@id": PERSON_ID },
    about: { "@id": PERSON_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/projects?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    ...overrides,
  };
}

export function getHomeGraphSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      getPersonSchema(),
      getOrganizationSchema(),
      getWebSiteSchema(),
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/#profilepage`,
        url: `${SITE_URL}/`,
        name: `${profile.name} — Portfolio`,
        description: SEO_DEFAULTS.description,
        inLanguage: ["en", "th"],
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: { "@id": PERSON_ID },
        about: { "@id": PERSON_ID },
      },
    ],
  };
}

export function getAboutPageSchema() {
  const aboutUrl = absoluteUrl("/about");
  return {
    "@context": "https://schema.org",
    "@graph": [
      getPersonSchema(),
      getWebSiteSchema(),
      {
        "@type": "ProfilePage",
        "@id": `${aboutUrl}#profilepage`,
        url: aboutUrl,
        name: `About ${profile.name} (ณภัทร ภมรสูตร)`,
        description: profile.about,
        inLanguage: ["en", "th"],
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: { "@id": PERSON_ID },
        about: { "@id": PERSON_ID },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: SEO_DEFAULTS.ogImage,
          caption: profile.name,
        },
      },
      {
        "@type": "AboutPage",
        "@id": `${aboutUrl}#aboutpage`,
        url: aboutUrl,
        name: `About ${profile.name}`,
        description: profile.about,
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: { "@id": PERSON_ID },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${aboutUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${SITE_URL}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "About",
            item: aboutUrl,
          },
        ],
      },
    ],
  };
}

export function getProjectsCollectionSchema(projectItems) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/projects#collection`,
        url: absoluteUrl("/projects"),
        name: "Projects",
        description:
          "Portfolio projects by Napat Pamornsut — web development, system design, and software testing.",
        isPartOf: { "@id": WEBSITE_ID },
        author: { "@id": PERSON_ID },
        mainEntity: {
          "@type": "ItemList",
          name: "Portfolio Projects",
          numberOfItems: projectItems.length,
          itemListElement: projectItems.map((project, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: absoluteUrl(`/projects/${project.slug}`),
            name: project.name,
          })),
        },
      },
    ],
  };
}

export function getProjectSchema({
  slug,
  title,
  description,
  image,
  technologies = [],
  stack,
  links = {},
}) {
  const projectUrl = absoluteUrl(`/projects/${slug}`);
  const imageUrl = toAbsoluteImageUrl(image);
  const metaDescription = normalizeMetaDescription(description, 300);
  const languages = stack
    ? stack.split(",").map((s) => s.trim())
    : technologies;

  const softwareApp = {
    "@type": "SoftwareApplication",
    "@id": `${projectUrl}#software`,
    name: title,
    description: metaDescription,
    url: projectUrl,
    image: imageUrl,
    applicationCategory: "WebApplication",
    operatingSystem: "Web Browser",
    author: { "@id": PERSON_ID },
    creator: { "@id": PERSON_ID },
    isPartOf: { "@id": WEBSITE_ID },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "THB",
      availability: "https://schema.org/OnlineOnly",
    },
  };

  if (languages.length > 0) {
    softwareApp.programmingLanguage = languages;
  }

  if (links.demo) {
    softwareApp.downloadUrl = links.demo;
  }

  if (links.repo) {
    softwareApp.codeRepository = links.repo;
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${projectUrl}#webpage`,
        url: projectUrl,
        name: title,
        description: metaDescription,
        inLanguage: ["en", "th"],
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": `${projectUrl}#software` },
        primaryImageOfPage: { "@id": `${projectUrl}#primaryimage` },
        breadcrumb: { "@id": `${projectUrl}#breadcrumb` },
      },
      {
        "@type": "ImageObject",
        "@id": `${projectUrl}#primaryimage`,
        url: imageUrl,
        contentUrl: imageUrl,
        caption: title,
      },
      softwareApp,
      {
        "@type": "BreadcrumbList",
        "@id": `${projectUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${SITE_URL}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Projects",
            item: absoluteUrl("/projects"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: title,
            item: projectUrl,
          },
        ],
      },
    ],
  };
}
