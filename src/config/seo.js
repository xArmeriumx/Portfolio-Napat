export const SITE_URL = "https://napatdev.com";
export const SITE_NAME = "Napatdev";
export const SITE_DESCRIPTION_EN =
  "Portfolio of Napat Pamornsut, a Web Developer and Software Tester in Bangkok, Thailand, featuring web applications, QA work, automation testing, and technical notes.";
export const SITE_DESCRIPTION_TH =
  "พอร์ตโฟลิโอของ ณภัทร ภมรสูตร นักพัฒนาเว็บและนักทดสอบซอฟต์แวร์ รวมผลงานเว็บ งาน QA ระบบอัตโนมัติ และโน้ตความรู้ด้านเทคนิค";

export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

// 1024x1024 brand mark used for schema.org image/logo objects that require
// a real square image (never the dynamic OG card or the legacy favicon).
export const SITE_LOGO_URL = `${SITE_URL}/icon.png`;
export const SITE_LOGO_WIDTH = 1024;
export const SITE_LOGO_HEIGHT = 1024;

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

export function getSiteSeoDefaults(profile, locale = "en") {
  const defaultTitle =
    locale === "th"
      ? `${profile.name} — นักพัฒนาเว็บและนักทดสอบซอฟต์แวร์ กรุงเทพฯ`
      : `${profile.name} — Web Developer & Software Tester in Bangkok`;
  const defaultDescription =
    locale === "th"
      ? `พอร์ตโฟลิโอของ ${profile.name} (ณภัทร ภมรสูตร) นักพัฒนาเว็บและนักทดสอบซอฟต์แวร์ในกรุงเทพฯ เชี่ยวชาญ Next.js TypeScript ฟูลสแต็กและการทดสอบอัตโนมัติ`
      : `${profile.name} is a Web Developer and Software Tester based in Bangkok, Thailand, specializing in Next.js, TypeScript, full-stack development and automated testing. พอร์ตโฟลิโอของ ณภัทร ภมรสูตร นักพัฒนาเว็บและนักทดสอบซอฟต์แวร์`;
  const profileTitle = getLocalizedSeoValue(profile.seo?.title, locale);
  const profileDescription = getLocalizedSeoValue(profile.seo?.description, locale);

  return {
    ...SEO_DEFAULTS,
    title: profileTitle || defaultTitle,
    description: profileDescription || defaultDescription,
    ogImage: profile.seo?.image || SEO_DEFAULTS.ogImage,
  };
}

// The static content adapter pins the square favicon as the profile/project
// image; only treat other values as real content images. Anything else falls
// back to the generated /api/og social card.
export function getRealContentImage(image) {
  if (!image) return undefined;
  if (image === SEO_DEFAULTS.ogImage || image === "/favicon.png") return undefined;
  return image;
}

function getLocalizedSeoValue(value, locale = "en") {
  if (locale === "th") return value?.th?.trim() || "";
  return value?.en?.trim() || "";
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

export function getAboutSeoMeta(profile, locale = "en") {
  const th = locale === "th";
  return {
    title: th ? `เกี่ยวกับ ${profile.name_th || profile.name}` : `About ${profile.name}`,
    description: normalizeMetaDescription(
      (th
          ? `${profile.about_th} อยู่ใน${profile.contact.location_th || profile.contact.location}`
          : `${profile.headline}. ${profile.about} Based in ${profile.contact.location}.`),
      180,
    ),
    ogImage: getRealContentImage(profile.seo?.image),
    ogImageAlt: th ? `${profile.name} — นักพัฒนาเว็บและนักทดสอบซอฟต์แวร์` : `${profile.name} — Web Developer & Software Tester`,
    path: th ? "/th/about" : "/about",
    keywords: th
      ? [`เกี่ยวกับ ${profile.name}`, "ณภัทร ภมรสูตร ประวัติ", "Napatdev profile", "นักพัฒนาเว็บ กรุงเทพ"]
      : ["About Napat Pamornsut", "ณภัทร ภมรสูตร ประวัติ", "Napatdev profile", "Web Developer Bangkok"],
  };
}

export function getProjectSeoMeta(project, getContent, profile, locale = "en") {
  const th = locale === "th";
  const title =
    getLocalizedSeoValue(project.seo?.title, locale) ||
    (th ? project.title_th || getContent(project, "title") : getContent(project, "title"));
  const description = normalizeMetaDescription(
    getLocalizedSeoValue(project.seo?.description, locale) ||
      (th
        ? project.description_th || getContent(project, "description")
        : getContent(project, "description")),
    180,
  );
  const image = getRealContentImage(project.seo?.image || project.images?.[0] || project.image);
  const technologies = (project.technologies || []).slice(0, 6).join(", ");

  return {
    title: `${title} — ${th ? "กรณีศึกษา" : "Case Study"}`,
    description,
    ogTitle: `${title} | Napat Pamornsut`,
    ogDescription: normalizeMetaDescription(
      `${description}${technologies ? ` Tech: ${technologies}.` : ""}`,
      200,
    ),
    ogImage: image,
    ogImageAlt: `${title} — portfolio project by ${profile.name}`,
    path: th ? `/th/projects/${project.slug}` : `/projects/${project.slug}`,
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

export function getProjectsListSeoMeta(profile, locale = "en") {
  const th = locale === "th";
  return {
    title: th ? `โปรเจคพัฒนาเว็บและทดสอบซอฟต์แวร์` : `Web Development & Software Testing Projects`,
    description: normalizeMetaDescription(
      th
        ? "รวมผลงานโปรเจคเว็บ ระบบ POS/ERP IoT Dashboard และงานทดสอบซอฟต์แวร์ของ ณภัทร ภมรสูตร ด้วย Next.js TypeScript Prisma Playwright"
        : "Explore full-stack web development, ERP/POS systems, IoT dashboards and software testing projects by Napat Pamornsut using Next.js, TypeScript, Prisma, Playwright and modern web technologies.",
      180,
    ),
    ogImage: getRealContentImage(profile.seo?.image),
    ogImageAlt: th ? "ผลงานโปรเจคของ ณภัทร ภมรสูตร" : "Napat Pamornsut portfolio projects",
    path: th ? "/th/projects" : "/projects",
    keywords: th
      ? ["ผลงาน ณภัทร ภมรสูตร", "Napatdev portfolio projects", "โปรเจคพัฒนาเว็บ", "พอร์ตโฟลิโอ"]
      : ["Napat Pamornsut projects", "Napatdev portfolio projects", "ณภัทร ภมรสูตร ผลงาน", "Web Developer portfolio"],
  };
}

export function getNotesListSeoMeta(profile, locale = "en") {
  const th = locale === "th";
  return {
    title: th ? `โน้ตความรู้และชีทสรุปสำหรับนักพัฒนา` : `Developer Notes & Cheatsheets`,
    description: normalizeMetaDescription(
      th
        ? `โน้ตความรู้และชีทสรุปด้านเทคนิคโดย ณภัทร ภมรสูตร`
        : `Developer notes and technical cheatsheets by ${profile.name}`,
      180,
    ),
    ogImage: getRealContentImage(profile.seo?.image),
    ogImageAlt: th ? `โน้ตความรู้ของ ${profile.name}` : `${profile.name} developer notes`,
    path: th ? "/th/notes" : "/notes",
    keywords: th
      ? ["โน้ตความรู้ ณภัทร ภมรสูตร", "Napatdev developer notes", "ชีทสรุป Next.js", "คู่มือ TypeScript", "ตัวอย่าง SQL"]
      : ["Napatdev developer notes", "ณภัทร ภมรสูตร โน้ตความรู้", "Next.js cheatsheet", "TypeScript reference", "SQL examples"],
  };
}

export function getContactSeoMeta(profile, locale = "en") {
  const th = locale === "th";
  return {
    title: th ? `ติดต่อ ${profile.name}` : `Contact ${profile.name}`,
    description: normalizeMetaDescription(
      th
        ? `ติดต่อ ${profile.name} สำหรับงานพัฒนาเว็บ QA และทดสอบซอฟต์แวร์ใน${profile.contact.location_th || profile.contact.location}`
        : `Contact ${profile.name} for web development, QA, automation testing, and software project inquiries in ${profile.contact.location}`,
      180,
    ),
    ogImage: getRealContentImage(profile.seo?.image),
    ogImageAlt: th ? `ข้อมูลติดต่อ ${profile.name}` : `${profile.name} contact information`,
    path: th ? "/th/contact" : "/contact",
    keywords: th
      ? ["ติดต่อ ณภัทร ภมรสูตร", "Napatdev contact", "ช่องทางติดต่อ", "นักพัฒนาเว็บ กรุงเทพ"]
      : ["Contact Napat Pamornsut", "ติดต่อ ณภัทร ภมรสูตร", "Napatdev contact", "Web Developer contact Bangkok"],
  };
}

export function getSearchSeoMeta(locale = "en") {
  const th = locale === "th";
  return {
    title: th ? `ค้นหาในเว็บ` : `Site Search`,
    description: normalizeMetaDescription(
      th
        ? "ค้นหาข้อมูลพอร์ตโฟลิโอ โปรเจค และโน้ตความรู้ของ ณภัทร ภมรสูตร"
        : "Search Napatdev portfolio pages, contact information, projects, case studies, and developer notes",
      180,
    ),
    path: th ? "/th/search" : "/search",
    keywords: th
      ? ["ค้นหา Napatdev", "Search Napatdev", "สารบัญเว็บไซต์", "ค้นหา ณภัทร ภมรสูตร"]
      : ["Search Napatdev", "ค้นหา Napatdev", "Napat Pamornsut site search", "ค้นหา ณภัทร ภมรสูตร"],
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
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: profile.name,
    alternateName: ["ณภัทร ภมรสูตร", "Napat Dev", "napatdev"],
    url: `${SITE_URL}/`,
    image: {
      "@type": "ImageObject",
      url: SITE_LOGO_URL,
      width: SITE_LOGO_WIDTH,
      height: SITE_LOGO_HEIGHT,
      caption: profile.name,
    },
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
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    alternateName: [`${profile.name} Portfolio`, "Napat Dev", "พอร์ตโฟลิโอ ณภัทร"],
    url: `${SITE_URL}/`,
    logo: {
      "@type": "ImageObject",
      url: SITE_LOGO_URL,
      width: SITE_LOGO_WIDTH,
      height: SITE_LOGO_HEIGHT,
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
    publisher: { "@id": PERSON_ID },
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
  return [getPersonSchema(profile), getWebSiteSchema(profile)];
}

export function getHomeGraphSchema(profile, locale = "en") {
  const seoDefaults = getSiteSeoDefaults(profile, locale);
  return {
    "@context": "https://schema.org",
    "@graph": [
      ...getCoreSiteSchemas(profile),
      {
        "@type": "ProfilePage",
        "@id": `${absoluteUrl(locale === "th" ? "/th" : "/")}#profilepage`,
        url: absoluteUrl(locale === "th" ? "/th" : "/"),
        name: getSiteSeoDefaults(profile, locale).title,
        alternateName: [`${profile.name} Portfolio`, `พอร์ตโฟลิโอ ${profile.name}`, "พอร์ตโฟลิโอ ณภัทร ภมรสูตร"],
        description: seoDefaults.description,
        inLanguage: locale,
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: { "@id": PERSON_ID },
        about: { "@id": PERSON_ID },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${absoluteUrl(locale === "th" ? "/th" : "/")}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home / หน้าแรก",
            item: absoluteUrl(locale === "th" ? "/th" : "/"),
          },
        ],
      },
    ],
  };
}

export function getAboutPageSchema(profile, locale = "en") {
  const aboutUrl = absoluteUrl(locale === "th" ? "/th/about" : "/about");
  return {
    "@context": "https://schema.org",
    "@graph": [
      ...getCoreSiteSchemas(profile),
      {
        "@type": "ProfilePage",
        "@id": `${aboutUrl}#profilepage`,
        url: aboutUrl,
        name: getAboutSeoMeta(profile, locale).title,
        alternateName: ["About Me", "เกี่ยวกับฉัน", `ประวัติ ${profile.name}`],
        description: locale === "th" ? profile.about_th : profile.about,
        inLanguage: locale,
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
        name: getAboutSeoMeta(profile, locale).title,
        alternateName: ["About Me", "เกี่ยวกับฉัน"],
        description: locale === "th" ? profile.about_th : profile.about,
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
            item: absoluteUrl(locale === "th" ? "/th" : "/"),
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

export function getProjectsCollectionSchema(projectItems, profile, locale = "en") {
  return {
    "@context": "https://schema.org",
    "@graph": [
      ...getCoreSiteSchemas(profile),
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}${locale === "th" ? "/th" : ""}/projects#collection`,
        url: absoluteUrl(locale === "th" ? "/th/projects" : "/projects"),
        name: locale === "th" ? "ผลงาน" : "Projects",
        alternateName: ["Projects", "โปรเจค", "ผลงาน"],
        description:
          "Portfolio projects by Napat Pamornsut — web development, system design, and software testing. รวมผลงานโปรเจคเว็บและงานทดสอบซอฟต์แวร์ของ ณภัทร ภมรสูตร",
        inLanguage: locale,
        isPartOf: { "@id": WEBSITE_ID },
        author: { "@id": PERSON_ID },
        mainEntity: {
          "@type": "ItemList",
          name: locale === "th" ? "ผลงาน" : "Portfolio Projects",
          numberOfItems: projectItems.length,
          itemListElement: projectItems.map((project, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: absoluteUrl(`${locale === "th" ? "/th" : ""}/projects/${project.slug}`),
            name: locale === "th" ? project.name_th || project.name : project.name,
            alternateName: project.name_th ? [project.name, project.name_th] : undefined,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}${locale === "th" ? "/th" : ""}/projects#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home / หน้าแรก", item: absoluteUrl(locale === "th" ? "/th" : "/") },
          { "@type": "ListItem", position: 2, name: locale === "th" ? "ผลงาน" : "Projects", item: absoluteUrl(locale === "th" ? "/th/projects" : "/projects") },
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
  locale = "en",
  profile,
}) {
  const projectUrl = absoluteUrl(`${locale === "th" ? "/th" : ""}/projects/${slug}`);
  const schemaTitle = getLocalizedSeoValue(seo?.title, locale) || title;
  const schemaDescription = getLocalizedSeoValue(seo?.description, locale) || description;
  const imageUrl = toAbsoluteImageUrl(seo?.image || image);
  const metaDescription = normalizeMetaDescription(schemaDescription, 300);
  const languages = stack
    ? stack.split(",").map((s) => s.trim())
    : technologies;

  const softwareApp = {
    "@type": "CreativeWork",
    "@id": `${projectUrl}#software`,
    name: schemaTitle,
    alternateName: titleTh ? [schemaTitle, titleTh] : undefined,
    description: metaDescription,
    url: projectUrl,
    image: imageUrl,
    genre: "Software development case study",
    keywords: [...role, ...keyFeatures, ...languages].join(", "),
    author: { "@id": PERSON_ID },
    creator: { "@id": PERSON_ID },
    isPartOf: { "@id": WEBSITE_ID },
  };


  if (links.demo) {
    softwareApp.sameAs = [links.demo];
  }

  if (links.repo) {
    softwareApp.relatedLink = links.repo;
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
        inLanguage: locale,
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
            item: absoluteUrl(locale === "th" ? "/th" : "/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: locale === "th" ? "ผลงาน" : "Projects",
            item: absoluteUrl(locale === "th" ? "/th/projects" : "/projects"),
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
