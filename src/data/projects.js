export const projects = [
  {
    slug: "clean-water-monitoring",
    title: "Clean Water Monitoring",
    // ✅ เปลี่ยนจาก image เป็น images (array) - รูปแรกจะแสดงในหน้าแรก
    images: [
      `${import.meta.env.BASE_URL}images/p1-clean-water.jpg`,
      // เพิ่มรูปเพิ่มเติมได้ที่นี่
      `${import.meta.env.BASE_URL}images/p1-clean-water1.jpg`,
      `${import.meta.env.BASE_URL}images/p1-clean-water2.jpg`,
      `${import.meta.env.BASE_URL}images/p1-clean-water3.jpg`,
    ],
    role: ["Fullstack Developer", "IoT Developer"],

    description: `
Final Year Project for real-time water quality monitoring.
System collects sensor data via MQTT and visualizes results
on dashboards with alerts and historical logs.
    `,

    technologies: [
      "React",
      "Chart.js",
      "MQTT",
      "Firebase",
      "ChakraUI",
      "LeafletJS",
      "IoT Technology",
    ],

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

    links: { demo: "https://cleanwatermonitoring.com/", repo: "" },
  },

  {
    slug: "stock-management-system",
    title: "Stock Management System",
    images: [
      `${import.meta.env.BASE_URL}images/p2-stock-management.jpg`,
      `${import.meta.env.BASE_URL}images/p2-stock-management1.jpg`,
      `${import.meta.env.BASE_URL}images/p2-stock-management2.jpg`,
      `${import.meta.env.BASE_URL}images/p2-stock-management3.jpg`,
      `${import.meta.env.BASE_URL}images/p2-stock-management4.jpg`,
    ],
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
    slug: "mentos-pharmacy-store",
    title: "Mentos Pharmacy Store",
    images: [
      `${import.meta.env.BASE_URL}images/p3-phamacy.png`,
      // เพิ่มรูปเพิ่มเติมได้
      `${import.meta.env.BASE_URL}images/p3-phamacy1.png`,
      `${import.meta.env.BASE_URL}images/p3-phamacy2.png`,
    ],
    role: ["Project Management", "Frontend Developer", "System Analyst"],

    description: `
An e-commerce pharmacy system for selling medicines and health supplements online. 
Features product catalog with categories, shopping cart management, order processing, 
and admin dashboard for inventory and customer management.
  `,

    technologies: ["PHP", "MySQL", "HTML", "CSS", "JavaScript", "Bootstrap"],

    keyFeatures: [
      "Product catalog with multiple categories (vitamins, supplements, medicines, health products)",
      "Shopping cart system with add/remove/update quantity functionality",
      "Order management - track orders from cart to checkout",
      "Product search and filtering by category",
      "Admin dashboard for managing orders, products, customers",
      "Inventory management - add, edit, delete products with images and pricing",
      "Customer management system",
      "Responsive design for mobile and desktop",
    ],

    highlights: [
      "Complete e-commerce flow (browse → cart → checkout)",
      "Admin panel for inventory & order management",
      "Category-based product organization",
      "Real-time cart total calculation",
    ],

    responsibilities: [
      "Design database schema for products, orders, customers, and categories",
      "Implement shopping cart functionality with session management",
      "Build admin dashboard for product and order management",
      "Create responsive UI for product listing and cart pages",
      "Develop order processing and checkout workflow",
      "Handle product CRUD operations with image upload",
    ],

    links: {
      demo: "",
      repo: "https://github.com/NapatPamornsuT/Phamazy",
    },
  },

  {
    slug: "uat-testkit",
    title: "UAT / Test Case & Bug Report Template",
    stack: "System Analyst • Software Tester",
    images: [`${import.meta.env.BASE_URL}images/p3-uat.png`],
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
