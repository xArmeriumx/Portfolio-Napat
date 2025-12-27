export const projects = [
  {
    slug: "clean-water-monitoring",
    title: "Clean Water Monitoring (FYP)",
    //stack: "React • Chart.js • MQTT • Firebase",
    image: `${import.meta.env.BASE_URL}images/p1-clean-water.jpg`,
    role: ["Fullstack Developer", "IoT Developer"],

    description: `
Final Year Project for real-time water quality monitoring.
System collects sensor data via MQTT and visualizes results
on dashboards with alerts and historical logs.
    `,

    // ✅ ใหม่: Technologies
    technologies: [
      "React",
      "Chart.js",
      "MQTT",
      "Firebase",
      "ChakraUI",
      "LeafletJS",
      "IoT Technology",
    ],

    // ✅ ใหม่: Key Features
    keyFeatures: [
      "Real-time sensor dashboard with charts",
      "Water quality logs & filtering",
      "Location mapping for monitoring points",
      "Lab document upload & tracking",
      "Issue reporting workflow",
    ],

    highlights: [
      "Real-time dashboards + logs",
      "Mapping locations",
      "Lab documents + issue reporting",
    ],

    responsibilities: [
      "Design dashboard layout",
      "Implement real-time data updates",
      "Handle data visualization & filtering",
    ],

    links: { demo: "", repo: "" },
  },

  {
    slug: "stock-management-system",
    title: "Stock Management System",
    //stack: "React • Node.js • PostgreSQL • JWT",
    image: `${import.meta.env.BASE_URL}images/p2-stock-management.jpg`,
    role: ["UX/UI Design", "System Analyst"],

    description: `
A comprehensive inventory management system designed for restaurants 
and food service businesses. Features product categorization, expiration 
tracking, purchase order management, and real-time notifications for 
stock alerts and expiring items.
  `,

    technologies: ["Figma", "Adobe XD"],

    keyFeatures: [
      "Multi-category product management – Fresh Food, Dried Food, Vegetables/Fruits, Condiments",
      "Real-time stock tracking – Product images, units, expiration dates, and supplier details",
      "Expiration alerts – Automatic notifications for items expiring in 2 days",
      "Role-based access control – Admin and Head Chef permissions with different views",
      "Purchase order workflow – Create, track, and manage supplier orders",
      "Notification center – Alert system for low stock and expiring products",
    ],

    highlights: [
      "Product catalog with images & categories",
      "Expiration tracking with 2-day alerts",
      "Purchase order management",
      "Role-based dashboards (Admin/Chef)",
    ],

    responsibilities: [
      "Design database schema for products, categories, and orders",
      "Implement authentication & authorization system",
      "Build responsive UI for product management",
      "Create notification system for stock alerts",
      "Develop purchase order workflow",
    ],

    links: { demo: "", repo: "" },
  },

  {
    slug: "uat-testkit",
    title: "UAT / Test Case & Bug Report Template",
    stack: "System Analyst • Software Tester",
    image: `${import.meta.env.BASE_URL}images/p3-uat.png`,
    role: ["System Analyst", "Tester"],

    description: `
Template set for UAT, test case design, and bug reporting
used in real projects to improve communication between
dev, tester, and business.
  `,

    technologies: [
      "UAT",
      "Test Case Design",
      "Bug Reporting",
      "Regression Testing",
    ],

    keyFeatures: [
      "Test case template with acceptance criteria",
      "Bug report format: steps / expected vs actual / severity",
      "Regression checklist for release validation",
      "Reusable structure for teams & clients",
    ],

    highlights: [
      "Test case structure with acceptance criteria",
      "Bug report format (steps / expected vs actual)",
      "Regression checklist for releases",
    ],

    responsibilities: [
      "Design UAT structure",
      "Define acceptance criteria",
      "Create reusable test templates",
    ],

    links: { demo: "", repo: "" },
  },
];
