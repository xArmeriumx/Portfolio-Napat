export const projects = [
  {
    slug: "shop-inventory-management",
    title: "Shop Inventory & Sales Management System",
    title_th: "Shop Inventory & Sales Management System (Multi-tenant POS)",
    images: [
      `${import.meta.env.BASE_URL}images/shop-inventory-1.png`,
      `${import.meta.env.BASE_URL}images/shop-inventory-2.png`,
      `${import.meta.env.BASE_URL}images/shop-inventory-3.png`,
      `${import.meta.env.BASE_URL}images/shop-inventory-4.png`,
      `${import.meta.env.BASE_URL}images/shop-inventory-5.png`,
      `${import.meta.env.BASE_URL}images/shop-inventory-6.png`,
      `${import.meta.env.BASE_URL}images/shop-inventory-7.png`,
      `${import.meta.env.BASE_URL}images/shop-inventory-8.png`,
      `${import.meta.env.BASE_URL}images/shop-inventory-9.png`,
    ],
    role: ["Fullstack Developer"],

    description: `
A comprehensive Inventory and Sales Management System designed for multi-tenant usage. 
Built with Next.js 14 and TypeScript, featuring Role-Based Access Control (RBAC), 
real-time stock tracking, and a dedicated POS interface. Prioritizes data integrity, 
robust audit trails, and seamless user onboarding.
    `,
    description_th: `
ระบบบริหารจัดการสต็อกและงานขายหน้าร้าน (POS) พัฒนาด้วย Next.js 14 และ TypeScript
ออกแบบให้รองรับหลายร้านค้าในระบบเดียว (Multi-tenant) โดยแต่ละร้านแยกข้อมูลกันอย่างชัดเจน
มีระบบจัดการสิทธิ์ผู้ใช้ (RBAC) ควบคุมการเข้าถึงตามบทบาท พร้อมระบบตรวจสอบย้อนกลับ (Stock Log) 
    `,

    technologies: [
      "Next.js 14",
      "TypeScript",
      "Prisma",
      "PostgreSQL",
      "TailwindCSS",
      "Shadcn UI",
      "NextAuth.js",
      "Supabase",
      "Recharts",
      "Zod",
    ],

    keyFeatures: [
      "Multi-tenant architecture supporting multiple independent shops",
      "Role-Based Access Control (RBAC) with granular permissions",
      "Point of Sale (POS) system with barcode interaction and real-time sync",
      "Inventory management with stock movement history and low-stock alerts",
      "Sales & Purchase workflow with audit-ready cancellation",
      "Financial reporting dashboard (Revenue, Expense, Profit)",
      "Receipt upload and management via Supabase Storage",
      "Automated Tax Invoice and Receipt generation",
    ],
    keyFeatures_th: [
      "Multi-tenant — แต่ละร้านค้าแยกข้อมูลกันในระบบเดียว ไม่ปนกัน",
      "RBAC — ออกแบบระบบสิทธิ์ตามบทบาท (Owner, Manager, Cashier) แต่ละ Role เห็นและทำได้ต่างกัน",
      "POS — รองรับการต่อเครื่องอ่านบาร์โค้ด และตัดสต็อกทันทีเมื่อมีการขาย",
      "Inventory — ติดตามการเคลื่อนไหวของสินค้า และแจ้งเตือนเมื่อสินค้าใกล้หมด",
      "Audit Trail — บันทึกทุกธุรกรรม รวมถึงเหตุผลการยกเลิกบิล เพื่อตรวจสอบย้อนกลับ",
      "Dashboard — แสดงสรุปยอดรายรับ รายจ่าย และกำไรด้วยกราฟ Recharts",
      "File Management — เก็บสลิปและหลักฐานการชำระเงินผ่าน Supabase Storage",
      "Auto PDF — สร้างใบกำกับภาษีและใบเสร็จเป็นไฟล์ PDF อัตโนมัติ",
    ],

    highlights: [
      "Full-stack development with Next.js 14 App Router",
      "End-to-end type safety with TypeScript and Zod",
      "Secure and scalable database schema with Prisma",
      "Real-time permission enforcement",
    ],
    highlights_th: [
      "ใช้ Next.js 14 App Router ร่วมกับ Server Components และ Server Actions",
      "ตรวจสอบชนิดข้อมูลทั้งระบบด้วย TypeScript และ Zod",
      "ออกแบบ Schema ฐานข้อมูลด้วย Prisma ORM รองรับโครงสร้าง Multi-tenant",
      "ระบบยืนยันตัวตนด้วย NextAuth.js พร้อมตรวจสิทธิ์ทุก Request",
    ],

    responsibilities: [
      "Architect and database design for multi-tenant system",
      "Implement secure authentication & authorization flows",
      "Build complex POS UI/UX for desktop and tablet",
      "Develop comprehensive inventory tracking algorithms",
      "Create financial analytics and visualization modules",
      "Setup automated CI/CD and deployment to Vercel",
    ],
    responsibilities_th: [
      "ออกแบบ Schema ฐานข้อมูลสำหรับระบบ Multi-tenant และความสัมพันธ์ระหว่างข้อมูล",
      "พัฒนาระบบ Authentication และออกแบบ RBAC สำหรับจัดการสิทธิ์ผู้ใช้",
      "พัฒนาหน้า UI ระบบ POS ให้ใช้งานได้บน Desktop และ Tablet",
      "เขียน Logic การคำนวณสต็อก การตัดสินค้า และการวิเคราะห์ต้นทุน",
      "สร้างหน้า Dashboard แสดงข้อมูลทางการเงินด้วยกราฟ",
      "ตั้งค่า CI/CD Pipeline และ Deploy ขึ้น Vercel",
    ],

    links: {
      demo: "https://shop-inventory.napatdev.com",
      repo: "https://github.com/xArmeriumx/Shop-inventory",
    },
  },
  {
    slug: "jodbill-expense-tracker",
    title: "JodBill — Smart Expense Tracker",
    title_th: "JodBill — แอปบันทึกรายรับรายจ่าย (AI-Powered PWA)",
    images: [
      `${import.meta.env.BASE_URL}images/jodbill-1.png`,
      `${import.meta.env.BASE_URL}images/jodbill-2.png`,
      `${import.meta.env.BASE_URL}images/jodbill-3.png`,
      `${import.meta.env.BASE_URL}images/jodbill-4.png`,
      `${import.meta.env.BASE_URL}images/jodbill-5.png`,
      `${import.meta.env.BASE_URL}images/jodbill-6.png`,
    ],
    role: ["Fullstack Developer"],

    description: `
A personal finance PWA — scan receipts with AI, track income & expenses, 
set budgets, and get AI-driven financial coaching. Designed as a mobile-first 
app with native-like UX that can be installed on any device.
    `,
    description_th: `
แอปบันทึกรายรับรายจ่ายส่วนตัว พัฒนาเป็น PWA ให้ติดตั้งได้เหมือนแอปปกติโดยไม่ต้องผ่าน Store
ฟีเจอร์หลักคือการใช้ AI สแกนใบเสร็จ บันทึกรายการ ตั้งงบประมาณ และรับคำแนะนำการเงินจาก AI
ออกแบบเน้น Mobile-first ให้ใช้งานลื่นบนมือถือ และรองรับโหมด Offline
    `,

    technologies: [
      "Next.js 14",
      "TypeScript",
      "Prisma",
      "PostgreSQL",
      "TailwindCSS",
      "NextAuth.js",
      "Supabase",
      "AI / LLM",
      "PWA",
    ],

    keyFeatures: [
      "AI Receipt Scanner — Snap a photo and AI extracts vendor, items, and totals automatically",
      "AI Financial Coach — Analyzes spending behavior and gives personalized financial advice",
      "Budget & Savings — Set monthly budgets, track savings goals with visual charts",
      "Reports & History — Monthly summaries, trend comparisons, searchable transaction history",
      "PWA & Offline — Installable on mobile, works offline, native-app-like UX",
    ],
    keyFeatures_th: [
      "AI สแกนใบเสร็จ — ถ่ายรูปใบเสร็จ แล้ว AI ดึงชื่อร้าน รายการสินค้า และยอดเงินให้อัตโนมัติ",
      "AI Financial Coach — วิเคราะห์พฤติกรรมการใช้จ่าย และให้คำแนะนำการเงินเฉพาะบุคคล",
      "งบประมาณ & ออมเงิน — ตั้งงบรายเดือน ติดตามเป้าหมายออมเงิน พร้อมกราฟแสดงความคืบหน้า",
      "รายงาน & ประวัติ — ดูสรุปรายเดือน เปรียบเทียบแนวโน้ม และค้นหารายการย้อนหลัง",
      "PWA & Offline — ติดตั้งได้บนมือถือ ใช้งานได้แม้ไม่มีอินเทอร์เน็ต",
    ],

    highlights: [
      "AI-Powered — Receipt scanning + financial analysis with AI in one app",
      "Mobile-First PWA — Works on any device, installable, offline-capable",
      "Full-stack — Built frontend, backend, database, and AI integration end-to-end",
    ],
    highlights_th: [
      "เชื่อมต่อ AI เพื่อสแกนใบเสร็จและวิเคราะห์การเงินในแอปเดียว",
      "ออกแบบเป็น Mobile-first PWA ติดตั้งได้และใช้งาน Offline ได้",
      "พัฒนาครบทั้ง Frontend, Backend, Database และ AI Integration",
    ],

    responsibilities: [
      "Full-stack development with Next.js 14 (App Router, Server Actions)",
      "Database design and implementation with Prisma ORM",
      "AI integration — receipt scanning and financial coaching",
      "Authentication, security, and API protection",
      "PWA setup with service worker and offline support",
    ],
    responsibilities_th: [
      "พัฒนา Full-stack ด้วย Next.js 14 (App Router, Server Actions)",
      "ออกแบบและสร้างฐานข้อมูลด้วย Prisma ORM",
      "เชื่อมต่อ AI สำหรับฟีเจอร์สแกนใบเสร็จและ Financial Coach",
      "ออกแบบระบบ Authentication และป้องกัน API",
      "ตั้งค่า PWA ด้วย Service Worker เพื่อรองรับ Offline Mode",
    ],

    links: {
      demo: "https://jodbill.napatdev.com/",
      repo: "https://github.com/xArmeriumx/Billsnap-miniproject",
    },
  },
  {
    slug: "clean-water-monitoring",
    title: "Clean Water Monitoring",
    title_th: "Clean Water Monitoring (IoT + Real-time Dashboard)",
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
    description_th: `
โปรเจกต์ปริญญานิพนธ์ — ระบบติดตามคุณภาพน้ำแบบ Real-time
เซ็นเซอร์ IoT ส่งข้อมูลผ่าน MQTT มาเก็บใน Firebase แล้วแสดงผลบน Dashboard
พัฒนาด้วย React (Frontend) และ Node.js/Express (Backend) แยก Deployment ที่ Vercel และ Render
ผู้ใช้ทั่วไปเข้าผ่าน LINE LIFF ส่วน Admin ใช้ JWT Authentication
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
    keyFeatures_th: [
      "Real-time Dashboard — แสดงกราฟค่า pH, TDS, ความขุ่น, อุณหภูมิ อัปเดตทันทีจากเซ็นเซอร์ ด้วย Chart.js",
      "แผนที่จุดให้บริการน้ำ — แสดงตำแหน่งจุดบริการน้ำดื่มบนแผนที่ด้วย Leaflet.js",
      "ระบบยืนยันตัวตน 2 รูปแบบ — ผู้ใช้ทั่วไปเข้าผ่าน LINE LIFF, Admin เข้าด้วย JWT",
      "แจ้งปัญหาได้พร้อมแนบรูปภาพ — อัปโหลดรูปเก็บไว้ที่ Cloudinary",
      "จัดการเอกสารผลตรวจน้ำ — อัปโหลดและดาวน์โหลดรายงาน Lab",
      "จัดการสิทธิ์ผู้ใช้ตามบทบาท — Admin, Lab Staff, User เห็นข้อมูลต่างกัน",
      "Activity Logs — บันทึกประวัติการใช้งานเพื่อตรวจสอบย้อนกลับ",
      "Device Management — ลงทะเบียนและตรวจสอบสถานะอุปกรณ์เซ็นเซอร์",
      "REST API 6 โมดูล — auth, locations, issues, users, devices, logs",
    ],

    highlights: [
      "Full-stack development (React + Node.js/Express)",
      "IoT integration with MQTT protocol",
      "LINE LIFF authentication",
      "Admin dashboard + User portal",
    ],
    highlights_th: [
      "พัฒนา Full-stack แยก React SPA กับ Express API คนละ Service",
      "รับข้อมูลจากเซ็นเซอร์ IoT ผ่าน MQTT Protocol แบบ Real-time",
      "ใช้ LINE LIFF SDK ให้ผู้ใช้เข้าระบบผ่าน LINE Account ได้เลย",
      "แยก Admin Dashboard ออกจาก User Portal ชัดเจน",
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
    responsibilities_th: [
      "ออกแบบและพัฒนา REST API ด้วย Express.js ครบ 6 โมดูล",
      "พัฒนา Frontend ด้วย React และ Chakra UI",
      "เชื่อมต่อ Firebase Realtime Database สำหรับจัดเก็บและ sync ข้อมูลเซ็นเซอร์",
      "ตั้งค่า MQTT Broker เพื่อรับข้อมูลจากอุปกรณ์ IoT",
      "เชื่อมต่อ LINE LIFF SDK และจัดการ JWT Token สำหรับ Admin",
      "สร้างระบบ CRUD สำหรับจัดการจุดบริการ ผู้ใช้ และอุปกรณ์ IoT",
      "พัฒนาระบบอัปโหลดรูปภาพผ่าน Cloudinary",
      "Deploy Frontend บน Vercel และ Backend บน Render",
    ],

    links: { demo: "https://cleanwatermonitoring.com/", repo: "" },
  },

  {
    slug: "automate-test-pipeline",
    title: "Automated Testing for Clean Water Monitoring",
    title_th: "Automated Testing Suite (Playwright + CI/CD)",
    images: [
      `${import.meta.env.BASE_URL}images/p5-testcase2.png`,
      `${import.meta.env.BASE_URL}images/p5-testcase.png`,
      `${import.meta.env.BASE_URL}images/p5-testcase1.png`,
    ],
    role: ["Automation Tester"],

    description: `
Comprehensive automated testing suite for the Clean Water Monitoring project.
Covers API testing (6 modules), Admin UI testing, and E2E flows using Playwright.
Includes custom scripts for test pipeline, result export, and Google Sheets integration.
    `,
    description_th: `
ชุดทดสอบอัตโนมัติสำหรับโปรเจกต์ Clean Water Monitoring พัฒนาด้วย Playwright และ TypeScript
ครอบคลุม API Testing (6 โมดูล), Admin UI Testing และ E2E Testing ตาม User Flow จริง
มี Custom Script (Node.js) สำหรับควบคุมลำดับการรันเทส ส่งออกผลลัพธ์ และอัปโหลดขึ้น Google Sheets
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
    keyFeatures_th: [
      "API Testing — ทดสอบ API ครบ 6 โมดูล ตรวจสอบ Response, Status Code และโครงสร้างข้อมูล",
      "UI Testing — ทดสอบการทำงานของหน้า Admin Dashboard และ Flow การจัดการข้อมูล",
      "E2E Testing — จำลอง User Flow จริงตั้งแต่ Login จนถึงการใช้งานฟีเจอร์ต่างๆ ด้วย Page Object Model",
      "Multi-environment — ตั้งค่า Environment แยกสำหรับ Dev, Staging และ Production",
      "Custom Pipeline — สคริปต์ Node.js ตรวจสอบสถานะ Server ก่อนรัน และควบคุมลำดับการทดสอบ",
      "Result Export — แปลงผลการทดสอบเป็นไฟล์ CSV และ JSON อัตโนมัติ",
      "Google Sheets Integration — อัปโหลดผลการทดสอบขึ้น Google Sheets ผ่าน API",
      "CI/CD — ทำงานอัตโนมัติผ่าน GitHub Actions ทุกครั้งที่มีการ Push Code",
    ],

    highlights: [
      "6 API test suites + Admin UI + E2E tests",
      "Custom Node.js pipeline & export scripts",
      "Multi-environment configs (.env.production, .env.staging)",
      "Google Sheets auto-upload for test results",
    ],
    highlights_th: [
      "ครอบคลุมทั้ง API, UI และ E2E Testing ในโปรเจกต์เดียว",
      "เขียน Custom Script (Node.js) สำหรับควบคุม Pipeline และส่งออกผลลัพธ์",
      "จัดการ Environment แยกด้วยไฟล์ .env ตาม Stage การ Deploy",
      "รายงานผลอัตโนมัติขึ้น Google Sheets หลังการทดสอบเสร็จ",
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
    responsibilities_th: [
      "ออกแบบโครงสร้าง Test Framework ด้วยรูปแบบ Page Object Model (POM)",
      "เขียน Test Cases สำหรับ API ทั้ง 6 โมดูล และ UI ฝั่ง Admin",
      "พัฒนา pipeline.js สำหรับควบคุมลำดับการรันเทสและตรวจสถานะ Server",
      "เขียน Script แปลงผลลัพธ์เป็น CSV และ JSON",
      "เชื่อมต่อ Google Sheets API เพื่ออัปโหลดผลการทดสอบ",
      "ตั้งค่า Playwright รองรับหลาย Browser และหลาย Environment",
      "ตั้งค่า GitHub Actions Workflow พร้อมจัดการ Secrets",
    ],

    links: {
      demo: "https://docs.google.com/spreadsheets/d/1J2LEMbimPGh7JnK3hQky7QK2_lML8s8mQ_osI3Li0k4/edit?gid=0#gid=0",
      repo: "https://github.com/xArmeriumx/-Automate-Test-with-Playwright-Clean-Water-Monitoring-",
    },
  },
  {
    slug: "stock-management-system",
    title: "Stock Management System",
    title_th: "Stock Management System (UX/UI Design)",
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
    description_th: `
ออกแบบ UX/UI สำหรับระบบจัดการสินค้าคงคลังของร้านอาหาร ใช้ Figma และ Adobe XD
วิเคราะห์ Business Logic ของธุรกิจร้านอาหาร เช่น การแยกประเภทวัตถุดิบ การติดตามวันหมดอายุ
และ Workflow การสั่งซื้อ แล้วนำมาออกแบบเป็น Prototype ที่ใช้งานได้จริง
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
    keyFeatures_th: [
      "จัดการหมวดหมู่สินค้า — แบ่งแยกประเภทวัตถุดิบ เช่น อาหารสด, ของแห้ง, ผักผลไม้",
      "ติดตามสต็อก — แสดงรายละเอียดสินค้า รูปภาพ หน่วยนับ และวันหมดอายุ",
      "แจ้งเตือนวันหมดอายุ — ออกแบบระบบ Alert แจ้งเตือนล่วงหน้า 2 วันก่อนหมดอายุ",
      "แบ่งสิทธิ์ UI ตามบทบาท — Admin และ Head Chef เห็น Dashboard และเมนูต่างกัน",
      "Purchase Order Workflow — ออกแบบขั้นตอนตั้งแต่สร้างใบสั่งซื้อจนถึงรับสินค้าเข้าสต็อก",
      "Notification Center — รวมแจ้งเตือนสินค้าใกล้หมดและใกล้หมดอายุไว้ในที่เดียว",
    ],

    highlights: [
      "Product catalog with images & categories",
      "Expiration tracking with 2-day alerts",
      "Purchase order management",
      "Role-based dashboards (Admin/Chef)",
    ],
    highlights_th: [
      "ออกแบบ Catalog แสดงสินค้าพร้อมรูปภาพและหมวดหมู่",
      "ระบบแจ้งเตือนวันหมดอายุล่วงหน้า 2 วัน",
      "ออกแบบ Flow การสั่งซื้อสินค้าให้เข้าใจง่าย",
      "Dashboard แยกตาม Role ของผู้ใช้งาน",
    ],

    responsibilities: [
      "Design database schema for products, categories, and orders",
      "Implement authentication & authorization system",
      "Build responsive UI for product management",
      "Create notification system for stock alerts",
      "Develop purchase order workflow",
    ],
    responsibilities_th: [
      "วิเคราะห์ความต้องการและออกแบบ Database Schema สำหรับสินค้าและคำสั่งซื้อ",
      "ออกแบบระบบสิทธิ์และ Flow การยืนยันตัวตนของแต่ละบทบาท",
      "สร้าง UI Mockups แบบ Hi-Fidelity ด้วย Figma และ Adobe XD",
      "ออกแบบ UX สำหรับระบบแจ้งเตือนสินค้า",
      "ออกแบบ Workflow การสั่งซื้อสินค้าตั้งแต่ต้นจนจบ",
    ],

    links: { demo: "", repo: "" },
  },

  {
    slug: "pharmacy-store",
    title: "Pharmacy Store",
    title_th: "Pharmacy E-commerce System (PHP + MySQL)",
    images: [
      `${import.meta.env.BASE_URL}images/p3-phamacy.png`,
      `${import.meta.env.BASE_URL}images/p3-phamacy1.png`,
      `${import.meta.env.BASE_URL}images/p3-phamacy2.png`,
    ],
    role: ["Project Management", "System Analyst"],

    description: `
An e-commerce pharmacy system for selling medicines and health supplements online. 
Features product catalog with categories, shopping cart management, order processing, 
and admin dashboard for inventory and customer management.
  `,
    description_th: `
ระบบ E-commerce สำหรับร้านขายยา พัฒนาด้วย PHP และ MySQL
Flow การซื้อขายครบตั้งแต่เลือกสินค้า → ใส่ตะกร้า → Checkout
มีหน้า Admin สำหรับจัดการสินค้า คำสั่งซื้อ และข้อมูลสมาชิก
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
    keyFeatures_th: [
      "Product Catalog — จัดหมวดหมู่สินค้า (ยา, วิตามิน, เวชภัณฑ์) ให้ค้นหาและกรองตามประเภทได้",
      "Shopping Cart — เพิ่ม/ลบ/แก้ไขจำนวนสินค้าในตะกร้า จัดการด้วย PHP Session",
      "Order Management — ติดตามสถานะคำสั่งซื้อตั้งแต่ Cart จนถึงจัดส่ง",
      "Search & Filter — ค้นหาสินค้าและกรองตามหมวดหมู่",
      "Admin Dashboard — จัดการสินค้า คำสั่งซื้อ และสมาชิกในหน้าเดียว",
      "Inventory CRUD — เพิ่ม แก้ไข ลบสินค้า พร้อมระบบอัปโหลดรูปภาพ",
      "Customer Management — จัดการข้อมูลสมาชิกและประวัติการซื้อ",
      "Responsive Design — ใช้งานได้ทั้งบนมือถือและคอมพิวเตอร์",
    ],

    highlights: [
      "Complete e-commerce flow (browse → cart → checkout)",
      "Admin panel for inventory & order management",
      "Category-based product organization",
      "Real-time cart total calculation",
    ],
    highlights_th: [
      "Flow การซื้อขายสมบูรณ์ครบวงจร (เลือกสินค้า → ตะกร้า → ชำระเงิน)",
      "Admin Panel สำหรับจัดการสินค้าและออเดอร์",
      "โครงสร้างสินค้าแบ่งตามหมวดหมู่",
      "คำนวณราคารวมในตะกร้าทันทีเมื่อมีการเปลี่ยนแปลง",
    ],

    responsibilities: [
      "Design database schema for products, orders, customers, and categories",
      "Implement shopping cart functionality with session management",
      "Build admin dashboard for product and order management",
      "Create responsive UI for product listing and cart pages",
      "Develop order processing and checkout workflow",
      "Handle product CRUD operations with image upload",
    ],
    responsibilities_th: [
      "ออกแบบ Database Schema สำหรับสินค้า ออเดอร์ และสมาชิก",
      "พัฒนาระบบตะกร้าสินค้าโดยใช้ PHP Session จัดการสถานะ",
      "สร้างหน้า Admin สำหรับ CRUD สินค้าและจัดการคำสั่งซื้อ",
      "เขียน HTML/CSS ให้หน้าเว็บรองรับทุกขนาดหน้าจอ (Responsive)",
      "พัฒนาระบบ Checkout และประมวลผลคำสั่งซื้อ",
      "พัฒนาระบบอัปโหลดและแสดงผลรูปภาพสินค้า",
    ],

    links: {
      demo: "",
      repo: "https://github.com/NapatPamornsuT/Phamazy",
    },
  },

  {
    slug: "uat-testkit",
    title: "UAT / Test Case & Bug Report Template",
    title_th: "UAT / Test Case & Bug Report Template",
    images: [`${import.meta.env.BASE_URL}images/p4-testcase.png`],
    role: ["System Analyst", "Software Tester"],

    description: `
Template set for UAT, test case design, and bug reporting
used in real projects to improve communication between
dev, tester, and business.
  `,
    description_th: `
ชุดเทมเพลตมาตรฐานสำหรับการทดสอบระบบ ประกอบด้วย UAT, Test Case Design และ Bug Report
ออกแบบให้ใช้ได้กับโปรเจกต์จริง ช่วยให้ทีม Developer, Tester และ Business คุยกันเข้าใจตรงกัน
สร้างขึ้นจากประสบการณ์ใช้งานจริง และออกแบบให้นำไปปรับใช้ซ้ำกับโปรเจกต์อื่นได้
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
    keyFeatures_th: [
      "Test Case Template — มีช่องระบุ Acceptance Criteria ชัดเจน ตรวจสอบได้ว่าผ่านหรือไม่ผ่าน",
      "Bug Report Format — ระบุขั้นตอนการ Reproduce, ผลที่คาดหวัง vs ผลที่เกิดจริง และระดับความรุนแรง",
      "Regression Checklist — รายการตรวจสอบก่อน Release ว่าฟีเจอร์เดิมยังทำงานได้ถูกต้อง",
      "Reusable Structure — โครงสร้างยืดหยุ่น ปรับให้เข้ากับโปรเจกต์ต่างๆ ได้",
    ],

    highlights: [
      "Test case structure with acceptance criteria",
      "Bug report format (steps / expected vs actual)",
      "Regression checklist for releases",
    ],
    highlights_th: [
      "โครงสร้าง Test Case เชื่อมโยงกับ Acceptance Criteria ของฝั่ง Business",
      "Bug Report ที่ระบุข้อมูลครบ ช่วยให้ Developer แก้ไขได้ตรงจุด",
      "Regression Checklist สำหรับตรวจสอบความพร้อมก่อน Deploy",
    ],

    responsibilities: [
      "Design UAT structure",
      "Define acceptance criteria",
      "Create reusable test templates",
    ],
    responsibilities_th: [
      "ออกแบบโครงสร้างเอกสาร UAT ให้ครอบคลุมทุก Scenario",
      "กำหนดรูปแบบ Acceptance Criteria ให้ตรวจสอบได้ชัดเจน",
      "สร้าง Test Template ที่นำกลับมาใช้ซ้ำได้กับโปรเจกต์อื่น",
    ],

    links: {
      demo: "https://docs.google.com/spreadsheets/d/13whAR8OIRtAWtpryLZRYJNYpehcxDzX5HF77uCd_tqA/edit?pli=1&gid=844435360#gid=844435360",
      repo: "",
    },
  },
];
