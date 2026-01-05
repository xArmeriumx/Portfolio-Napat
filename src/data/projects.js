export const projects = [
  {
    slug: "clean-water-monitoring",
    title: "Clean Water Monitoring",
    images: [
      `${import.meta.env.BASE_URL}images/p1-clean-water.jpg`,
      `${import.meta.env.BASE_URL}images/p1-clean-water1.jpg`,
      `${import.meta.env.BASE_URL}images/p1-clean-water2.jpg`,
      `${import.meta.env.BASE_URL}images/p1-clean-water3.jpg`,
    ],
    role: ["Fullstack Developer", "IoT Developer"],

    description: `
Final Year Project - Real-time water quality monitoring system.
Built with React frontend and Node.js/Express backend, integrated with 
IoT sensors via MQTT. Features include admin dashboard, user mapping, 
issue reporting, and LINE LIFF authentication.
    `,

    technologies: [
      "React",
      "Node.js",
      "Express",
      "Firebase Realtime Database",
      "MQTT",
      "LINE LIFF",
      "JWT Authentication",
      "Chakra UI",
      "Chart.js",
      "Leaflet",
      "Cloudinary",
    ],

    keyFeatures: [
      "Real-time sensor dashboard with pH, TDS, Turbidity, Temperature charts",
      "Interactive map with water service point locations (Leaflet)",
      "User authentication via LINE LIFF + Admin JWT login",
      "Issue reporting system with image upload (Cloudinary)",
      "Lab document management & upload",
      "User management with role-based access (Admin, Lab Staff, User)",
      "Activity logs & audit trail",
      "Device management for IoT sensors",
      "RESTful API with 6 route modules (auth, locations, issues, users, devices, logs)",
    ],

    highlights: [
      "Full-stack development (React + Node.js/Express)",
      "IoT integration with MQTT protocol",
      "LINE LIFF authentication",
      "Admin dashboard + User portal",
    ],

    responsibilities: [
      "Design & implement RESTful API with Express.js",
      "Build responsive React frontend with Chakra UI",
      "Integrate Firebase Realtime Database for data persistence",
      "Implement MQTT service for IoT sensor data",
      "Setup LINE LIFF authentication flow",
      "Create admin dashboard for location, user & device management",
      "Develop issue reporting workflow with Cloudinary image upload",
      "Deploy frontend to Vercel, backend to Render",
    ],

    links: { demo: "https://cleanwatermonitoring.com/", repo: "" },
  },

  {
    slug: "automate-test-pipeline",
    title: "Automated Testing for Clean Water Monitoring",
    images: [
      `${import.meta.env.BASE_URL}images/p5-testcase2.png`,
      `${import.meta.env.BASE_URL}images/p5-testcase.png`,
      `${import.meta.env.BASE_URL}images/p5-testcase1.png`,
    ],
    role: ["Automation Tester", "QA Engineer"],

    description: `
Comprehensive automated testing suite for the Clean Water Monitoring project.
Covers API testing (6 modules), Admin UI testing, and E2E flows using Playwright.
Includes custom scripts for test pipeline, result export, and Google Sheets integration.
    `,

    technologies: [
      "Playwright",
      "TypeScript",
      "Node.js",
      "GitHub Actions",
      "Google Sheets API",
      "dotenv",
    ],

    keyFeatures: [
      "API Testing - 6 modules: Auth, Devices, Issues, Locations, Logs, Users",
      "Admin UI Testing - Dashboard, Locations, Issues, User Management",
      "E2E Testing - Full user flows with Page Object Model",
      "Multi-environment support (dev, staging, production)",
      "Custom pipeline script with health check before tests",
      "Auto export results to CSV and JSON formats",
      "Google Sheets integration for test result reporting",
      "GitHub Actions CI/CD workflow",
    ],

    highlights: [
      "6 API test suites + Admin UI + E2E tests",
      "Custom Node.js pipeline & export scripts",
      "Multi-environment configs (.env.production, .env.staging)",
      "Google Sheets auto-upload for test results",
    ],

    responsibilities: [
      "Design test architecture with Page Object Model pattern",
      "Implement API tests for all 6 backend route modules",
      "Create Admin UI test suites (Dashboard, Locations, Issues, Users)",
      "Build custom pipeline.js for orchestrating test execution",
      "Develop export-results.js for CSV/JSON report generation",
      "Integrate Google Sheets API with upload-to-sheets.js",
      "Configure Playwright for multi-browser & multi-environment",
      "Setup GitHub Actions CI/CD workflow with secrets management",
    ],

    links: {
      demo: "https://docs.google.com/spreadsheets/d/1J2LEMbimPGh7JnK3hQky7QK2_lML8s8mQ_osI3Li0k4/edit?gid=0#gid=0",
      repo: "https://github.com/xArmeriumx/-Automate-Test-with-Playwright-Clean-Water-Monitoring-",
    },
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
    slug: "pharmacy-store",
    title: "Pharmacy Store",
    images: [
      `${import.meta.env.BASE_URL}images/p3-phamacy.png`,
      // เพิ่มรูปเพิ่มเติมได้
      `${import.meta.env.BASE_URL}images/p3-phamacy1.png`,
      `${import.meta.env.BASE_URL}images/p3-phamacy2.png`,
    ],
    role: ["Project Management", "System Analyst"],

    description: `
An e-commerce pharmacy system for selling medicines and health supplements online. 
Features product catalog with categories, shopping cart management, order processing, 
and admin dashboard for inventory and customer management.
  `,

    technologies: ["PHP", "MySQL", "HTML", "CSS", "JavaScript"],

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
    //stack: "System Analyst • Software Tester",
    images: [`${import.meta.env.BASE_URL}images/p4-testcase.png`],
    role: ["System Analyst", "Software Tester"],

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

    links: {
      demo: "https://docs.google.com/spreadsheets/d/13whAR8OIRtAWtpryLZRYJNYpehcxDzX5HF77uCd_tqA/edit?pli=1&gid=844435360#gid=844435360",
      repo: "",
    },
  },

];
