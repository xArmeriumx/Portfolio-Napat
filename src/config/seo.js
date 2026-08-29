export const SITE_URL = "https://napatdev.com";
export const SITE_NAME = "Napatdev";
export const SITE_DESCRIPTION_EN =
  "Portfolio of Napat Pamornsut, a Web Developer and Software Tester in Bangkok, Thailand, featuring web applications, QA work, automation testing, and technical notes.";
export const SITE_DESCRIPTION_TH =
  "พอร์ตโฟลิโอของ ณภัทร ภมรสูตร นักพัฒนาเว็บและนักทดสอบซอฟต์แวร์ รวมผลงานเว็บ งาน QA ระบบอัตโนมัติ และโน้ตความรู้ด้านเทคนิค";

export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

export const NAVIGATION_ITEMS = [
  {
    key: "home",
    name: "Home",
    name_th: "หน้าแรก",
    href: "/",
    description: "Portfolio homepage for Napat Pamornsut.",
    description_th: "หน้าแรกพอร์ตโฟลิโอของ ณภัทร ภมรสูตร",
    searchTerms: ["Napatdev", "Napat Pamornsut", "ณภัทร ภมรสูตร", "Portfolio", "พอร์ตโฟลิโอ"],
  },
  {
    key: "about",
    name: "About Me",
    name_th: "เกี่ยวกับฉัน",
    href: "/about",
    description: "Profile, education, skills, and background of Napat Pamornsut.",
    description_th: "ประวัติ การศึกษา ทักษะ และข้อมูลเกี่ยวกับ ณภัทร ภมรสูตร",
    searchTerms: ["About Napat Pamornsut", "เกี่ยวกับฉัน", "ประวัติ", "Web Developer Bangkok"],
  },
  {
    key: "projects",
    name: "Projects",
    name_th: "โปรเจค",
    href: "/projects",
    description: "Portfolio projects, case studies, demos, repositories, and technology stacks.",
    description_th: "รวมผลงานโปรเจค กรณีศึกษา เดโม Repository และเทคโนโลยีที่ใช้",
    searchTerms: ["Projects", "Portfolio Projects", "โปรเจค", "ผลงาน", "Case Study"],
  },
  {
    key: "contact",
    name: "Contact",
    name_th: "ติดต่อ",
    href: "/contact",
    description: "Contact information for web development, QA, and software testing inquiries.",
    description_th: "ช่องทางติดต่อสำหรับงานพัฒนาเว็บ QA และทดสอบซอฟต์แวร์",
    searchTerms: ["Contact", "ติดต่อ", "Napat Pamornsut email", "Web Developer Contact"],
  },
  {
    key: "notes",
    name: "Developer Notes",
    name_th: "โน้ตความรู้",
    href: "/notes",
    description: "Searchable developer notes and technical cheatsheets.",
    description_th: "โน้ตความรู้และชีทสรุปด้านเทคนิคสำหรับนักพัฒนา",
    searchTerms: ["Developer Notes", "Cheatsheet", "โน้ต", "คู่มือ", "Next.js", "TypeScript", "SQL"],
  },
  {
    key: "search",
    name: "Search",
    name_th: "ค้นหา",
    href: "/search",
    description: "Search index for portfolio pages, projects, contact details, and notes.",
    description_th: "หน้าค้นหาและสารบัญสำหรับหน้าเว็บ โปรเจค ช่องทางติดต่อ และโน้ตความรู้",
    searchTerms: ["Search", "ค้นหา", "Site Index", "สารบัญเว็บไซต์"],
  },
];

export const SEO_DEFAULTS = {
  title: `${SITE_NAME} | Portfolio`,
  description: `${SITE_DESCRIPTION_EN} ${SITE_DESCRIPTION_TH}`,
  ogImage: `${SITE_URL}/favicon.png`,
  locale: "en_US",
  alternateLocale: "th_TH",
  keywords: [
    "Napat Pamornsut",
    "ณภัทร ภมรสูตร",
    "Napatdev",
    "Web Developer Bangkok",
    "Software Tester Thailand",
    "QA Automation",
  ],
};

export function getSiteSeoDefaults(profile) {
  const defaultTitle = `${profile.name} (ณภัทร ภมรสูตร) | ${SITE_NAME}`;
  const defaultDescription =
    `Napatdev is the portfolio of ${profile.name} (ณภัทร ภมรสูตร), a Bangkok Web Developer and Software Tester focused on reliable web applications, QA, and automation testing.`;
  const profileTitle = getLocalizedSeoValue(profile.seo?.title);
  const profileDescription = getLocalizedSeoValue(profile.seo?.description);

  return {
    ...SEO_DEFAULTS,
    title: profileTitle || defaultTitle,
    description: profileDescription || defaultDescription,
    ogImage: profile.seo?.image || SEO_DEFAULTS.ogImage,
  };
}

function getLocalizedSeoValue(value) {
  return value?.en?.trim() || value?.th?.trim() || "";
}

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

export function getAboutSeoMeta(profile) {
  const siteSeo = getSiteSeoDefaults(profile);
  return {
    title: getLocalizedSeoValue(profile.seo?.title) || `About ${profile.name} | ณภัทร ภมรสูตร | ${SITE_NAME}`,
    description: normalizeMetaDescription(
      getLocalizedSeoValue(profile.seo?.description) || `${profile.headline}. ${profile.about} ${profile.about_th} Based in ${profile.contact.location}.`,
      180,
    ),
    ogImage: siteSeo.ogImage,
    ogImageAlt: `${profile.name} — Web Developer & Software Tester`,
    path: "/about",
    keywords: ["About Napat Pamornsut", "ณภัทร ภมรสูตร ประวัติ", "Napatdev profile", "Web Developer Bangkok"],
  };
}

export function getProjectSeoMeta(project, getContent, profile) {
  const title = getLocalizedSeoValue(project.seo?.title) || getContent(project, "title");
  const description = normalizeMetaDescription(
    getLocalizedSeoValue(project.seo?.description) || `${getContent(project, "description")} ${project.description_th || ""}`,
    180,
  );
  const image = project.seo?.image || project.images?.[0] || project.image || SEO_DEFAULTS.ogImage;
  const technologies = (project.technologies || []).slice(0, 6).join(", ");

  return {
    title: `${title} | ${profile.name} | ${SITE_NAME}`,
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
      project.title_th,
      "Napat Pamornsut project",
      "ณภัทร ภมรสูตร ผลงาน",
      "Napatdev portfolio",
      ...technologies.split(", "),
    ].filter(Boolean),
  };
}

export function getProjectsListSeoMeta(profile) {
  return {
    title: `Projects by ${profile.name} | ณภัทร ภมรสูตร | ${SITE_NAME}`,
    description: normalizeMetaDescription(
      "Explore portfolio projects by Napat Pamornsut — web development, ERP/POS systems, IoT dashboards, automation testing, and UX/UI design. รวมผลงานโปรเจคเว็บ ระบบ POS/ERP IoT Dashboard และงานทดสอบซอฟต์แวร์",
      180,
    ),
    ogImage: "/images/shop-inventory-1.png",
    ogImageAlt: "Napat Pamornsut portfolio projects",
    path: "/projects",
    keywords: ["Napat Pamornsut projects", "Napatdev portfolio projects", "ณภัทร ภมรสูตร ผลงาน", "Web Developer portfolio"],
  };
}

export function getContactSeoMeta(profile) {
  const siteSeo = getSiteSeoDefaults(profile);
  return {
    title: `Contact ${profile.name} | ติดต่อ ณภัทร ภมรสูตร | ${SITE_NAME}`,
    description: normalizeMetaDescription(
      `Contact ${profile.name} for web development, QA, automation testing, and software project inquiries in ${profile.contact.location}. ติดต่อ ณภัทร ภมรสูตร สำหรับงานพัฒนาเว็บ QA และทดสอบซอฟต์แวร์`,
      180,
    ),
    ogImage: siteSeo.ogImage,
    ogImageAlt: `${profile.name} contact information`,
    path: "/contact",
    keywords: ["Contact Napat Pamornsut", "ติดต่อ ณภัทร ภมรสูตร", "Napatdev contact", "Web Developer contact Bangkok"],
  };
}

export function getSearchSeoMeta() {
  return {
    title: `Search ${SITE_NAME} | Napat Pamornsut`,
    description: normalizeMetaDescription(
      "Search Napatdev portfolio pages, contact information, projects, case studies, and developer notes. ค้นหาข้อมูลพอร์ตโฟลิโอ โปรเจค และโน้ตความรู้ของ ณภัทร ภมรสูตร",
      180,
    ),
    path: "/search",
    keywords: ["Search Napatdev", "ค้นหา Napatdev", "Napat Pamornsut site search", "ค้นหา ณภัทร ภมรสูตร"],
  };
}

export function getSameAsLinks(profile) {
  return [profile.links.github, profile.links.linkedin].filter(
    (url) => url && url !== "#",
  );
}

export function getPersonSchema(profile, overrides = {}) {
  const skillNames = profile.skillCategories.flatMap((cat) =>
    cat.skills.map((s) => s.name),
  );
  const seoDefaults = getSiteSeoDefaults(profile);
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: profile.name,
    alternateName: ["ณภัทร ภมรสูตร", "Napat Dev", "napatdev"],
    url: `${SITE_URL}/`,
    image: seoDefaults.ogImage,
    jobTitle: profile.headline.replace(" | ", " and "),
    description: `${profile.about} ${profile.about_th}`,
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
    sameAs: getSameAsLinks(profile),
    ...overrides,
  };
}

export function getOrganizationSchema(profile, overrides = {}) {
  const seoDefaults = getSiteSeoDefaults(profile);
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    alternateName: [`${profile.name} Portfolio`, "Napat Dev", "พอร์ตโฟลิโอ ณภัทร"],
    url: `${SITE_URL}/`,
    logo: {
      "@type": "ImageObject",
      url: seoDefaults.ogImage,
      width: 512,
      height: 512,
    },
    founder: { "@id": PERSON_ID },
    sameAs: getSameAsLinks(profile),
    ...overrides,
  };
}

export function getWebSiteSchema(profile, overrides = {}) {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: `${profile.name} | ${SITE_NAME}`,
    alternateName: ["ณภัทร ภมรสูตร", "Napat Dev", "napatdev", "พอร์ตโฟลิโอ ณภัทร"],
    url: `${SITE_URL}/`,
    description: `${SITE_DESCRIPTION_EN} ${SITE_DESCRIPTION_TH}`,
    inLanguage: ["en", "th"],
    publisher: { "@id": ORGANIZATION_ID },
    author: { "@id": PERSON_ID },
    about: { "@id": PERSON_ID },
    hasPart: NAVIGATION_ITEMS.map((item) => ({
      "@type": "WebPage",
      name: item.name,
      alternateName: [item.name, item.name_th],
      description: `${item.description} ${item.description_th}`,
      inLanguage: ["en", "th"],
      url: absoluteUrl(item.href),
      isPartOf: { "@id": WEBSITE_ID },
    })),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    ...overrides,
  };
}

export function getCoreSiteSchemas(profile) {
  return [getPersonSchema(profile), getOrganizationSchema(profile), getWebSiteSchema(profile)];
}

export function getHomeGraphSchema(profile) {
  const seoDefaults = getSiteSeoDefaults(profile);
  return {
    "@context": "https://schema.org",
    "@graph": [
      ...getCoreSiteSchemas(profile),
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/#profilepage`,
        url: `${SITE_URL}/`,
        name: `${profile.name} — Portfolio / พอร์ตโฟลิโอ`,
        alternateName: [`${profile.name} Portfolio`, `พอร์ตโฟลิโอ ${profile.name}`, "พอร์ตโฟลิโอ ณภัทร ภมรสูตร"],
        description: seoDefaults.description,
        inLanguage: ["en", "th"],
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: { "@id": PERSON_ID },
        about: { "@id": PERSON_ID },
      },
    ],
  };
}

export function getAboutPageSchema(profile) {
  const aboutUrl = absoluteUrl("/about");
  return {
    "@context": "https://schema.org",
    "@graph": [
      ...getCoreSiteSchemas(profile),
      {
        "@type": "ProfilePage",
        "@id": `${aboutUrl}#profilepage`,
        url: aboutUrl,
        name: `About Me / เกี่ยวกับฉัน — ${profile.name} (ณภัทร ภมรสูตร)`,
        alternateName: ["About Me", "เกี่ยวกับฉัน", `ประวัติ ${profile.name}`],
        description: `${profile.about} ${profile.about_th}`,
        inLanguage: ["en", "th"],
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: { "@id": PERSON_ID },
        about: { "@id": PERSON_ID },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: getSiteSeoDefaults(profile).ogImage,
          caption: profile.name,
        },
      },
      {
        "@type": "AboutPage",
        "@id": `${aboutUrl}#aboutpage`,
        url: aboutUrl,
        name: `About Me / เกี่ยวกับฉัน — ${profile.name}`,
        alternateName: ["About Me", "เกี่ยวกับฉัน"],
        description: `${profile.about} ${profile.about_th}`,
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
            name: "Home / หน้าแรก",
            item: `${SITE_URL}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "About Me / เกี่ยวกับฉัน",
            item: aboutUrl,
          },
        ],
      },
    ],
  };
}

export function getProjectsCollectionSchema(projectItems, profile) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      ...getCoreSiteSchemas(profile),
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/projects#collection`,
        url: absoluteUrl("/projects"),
        name: "Projects / โปรเจค",
        alternateName: ["Projects", "โปรเจค", "ผลงาน"],
        description:
          "Portfolio projects by Napat Pamornsut — web development, system design, and software testing. รวมผลงานโปรเจคเว็บและงานทดสอบซอฟต์แวร์ของ ณภัทร ภมรสูตร",
        inLanguage: ["en", "th"],
        isPartOf: { "@id": WEBSITE_ID },
        author: { "@id": PERSON_ID },
        mainEntity: {
          "@type": "ItemList",
          name: "Portfolio Projects / ผลงานโปรเจค",
          numberOfItems: projectItems.length,
          itemListElement: projectItems.map((project, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: absoluteUrl(`/projects/${project.slug}`),
            name: project.name,
            alternateName: project.name_th ? [project.name, project.name_th] : undefined,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/projects#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home / หน้าแรก", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Projects / โปรเจค", item: absoluteUrl("/projects") },
        ],
      },
    ],
  };
}

export function getProjectSchema({
  slug,
  title,
  titleTh,
  description,
  image,
  technologies = [],
  keyFeatures = [],
  role = [],
  stack = undefined,
  links = {},
  seo = null,
  profile,
}) {
  const projectUrl = absoluteUrl(`/projects/${slug}`);
  const schemaTitle = getLocalizedSeoValue(seo?.title) || title;
  const schemaDescription = getLocalizedSeoValue(seo?.description) || description;
  const imageUrl = toAbsoluteImageUrl(seo?.image || image);
  const metaDescription = normalizeMetaDescription(schemaDescription, 300);
  const languages = stack
    ? stack.split(",").map((s) => s.trim())
    : technologies;

  const softwareApp = {
    "@type": "SoftwareApplication",
    "@id": `${projectUrl}#software`,
    name: schemaTitle,
    alternateName: titleTh ? [schemaTitle, titleTh] : undefined,
    description: metaDescription,
    url: projectUrl,
    image: imageUrl,
    applicationCategory: "WebApplication",
    applicationSubCategory: role.join(", "),
    operatingSystem: "Web Browser",
    featureList: keyFeatures,
    author: { "@id": PERSON_ID },
    creator: { "@id": PERSON_ID },
    isPartOf: { "@id": WEBSITE_ID },
  };

  if (languages.length > 0) {
    softwareApp.programmingLanguage = languages;
  }

  if (links.demo) {
    softwareApp.sameAs = [links.demo];
  }

  if (links.repo) {
    softwareApp.codeRepository = links.repo;
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      ...getCoreSiteSchemas(profile),
      {
        "@type": "WebPage",
        "@id": `${projectUrl}#webpage`,
        url: projectUrl,
        name: schemaTitle,
        alternateName: titleTh ? [schemaTitle, titleTh] : undefined,
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
            name: "Home / หน้าแรก",
            item: `${SITE_URL}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Projects / โปรเจค",
            item: absoluteUrl("/projects"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: titleTh ? `${schemaTitle} / ${titleTh}` : schemaTitle,
            item: projectUrl,
          },
        ],
      },
    ],
  };
}
