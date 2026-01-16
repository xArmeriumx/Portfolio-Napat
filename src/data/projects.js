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
เว็บแอปพลิเคชันจัดการสต็อกและงานขายหน้าร้าน (POS) แบบครบวงจร พัฒนาด้วย Next.js 14 และ TypeScript (Full-stack)
รองรับการใช้งานหลายร้านค้า (Multi-tenant Architecture) มีระบบจัดการสิทธิ์ผู้ใช้ (RBAC) ที่ยืดหยุ่นและการตัดสต็อกแบบ Real-time
เก็บข้อมูลด้วย Prisma ORM และ PostgreSQL ระบบตรวจสอบย้อนกลับ (Audit Logging) และการจัดการไฟล์ผ่าน Supabase
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
      "สถาปัตยกรรม Multi-tenant แบ่งแยกข้อมูลแต่ละร้านค้าอย่างชัดเจน รองรับการขยายตัว",
      "ระบบจัดการสิทธิ์ (RBAC) กำหนดสิทธิ์การเข้าถึงละเอียดตามบทบาท (Owner, Manager, Cashier)",
      "ระบบ POS รองรับการเชื่อมต่อเครื่องอ่านบาร์โค้ด และตัดสต็อกทันทีเมื่อขาย",
      "ระบบจัดการสินค้าคงคลัง ติดตามความเคลื่อนไหวสินค้า และแจ้งเตือนสินค้าใกล้หมด",
      "ระบบตรวจสอบย้อนกลับ (Audit Trail) บันทึกทุกธุรกรรม และตรวจสอบสาเหตุการยกเลิกบิล",
      "แดชบอร์ดสรุปยอดขายแสดงผลกราฟด้วย Recharts (รายรับ, รายจ่าย, กำไร)",
      "ระบบจัดการไฟล์และเอกสาร เก็บหลักฐานการโอนและสลิปผ่าน Supabase",
      "สร้างเอกสารอัตโนมัติ ทั้งใบกำกับภาษีและใบเสร็จรับเงินเป็นไฟล์ PDF",
    ],

    highlights: [
      "Full-stack development with Next.js 14 App Router",
      "End-to-end type safety with TypeScript and Zod",
      "Secure and scalable database schema with Prisma",
      "Real-time permission enforcement",
    ],
    highlights_th: [
      "พัฒนาด้วย Next.js 14 App Router ใช้ฟีเจอร์ Server Components และ Server Actions",
      "ตรวจสอบชนิดข้อมูล (Type Safety) ทั้งระบบด้วย TypeScript และ Zod",
      "ออกแบบฐานข้อมูลเน้นประสิทธิภาพและการขยายตัวด้วย Prisma ORM",
      "ระบบยืนยันตัวตน NextAuth.js พร้อมการตรวจสอบสิทธิ์แบบ Real-time",
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
      "ออกแบบโครงสร้างฐานข้อมูล (Schema Design) รองรับระบบ Multi-tenant และความสัมพันธ์ข้อมูลที่ซับซ้อน",
      "พัฒนาระบบยืนยันตัวตนและการจัดการสิทธิ์ (Auth & RBAC) ให้มีความปลอดภัยสูง",
      "พัฒนาส่วนติดต่อผู้ใช้ (Frontend) ระบบ POS ให้รองรับการใช้งานบน Desktop และ Tablet",
      "เขียน Logic การคำนวณสินค้าคงคลัง การตัดสต็อก และการวิเคราะห์ต้นทุน",
      "สร้างระบบรายงานและการแสดงผลกราฟข้อมูลทางการเงิน",
      "ตั้งค่าระบบ CI/CD และการ Deploy ขึ้นบน Vercel",
    ],

    links: {
      demo: "https://shop-inventory.napatdev.com",
      repo: "https://github.com/xArmeriumx/Shop-inventory",
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
ระบบติดตามคุณภาพน้ำแบบ Real-time (IoT Full-stack Application)
พัฒนาด้วย React และ Node.js/Express รับส่งข้อมูลจากเซ็นเซอร์ผ่าน MQTT Protocol
ใช้ Firebase สำหรับจัดการข้อมูลแบบ Real-time และยืนยันตัวตนผู้ใช้ผ่าน LINE LIFF
แสดงผลข้อมูลผ่าน Dashboard กราฟ และแผนที่ Leaflet
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
      "Real-time Dashboard แสดงผลกราฟค่า pH, TDS, ความขุ่น, อุณหภูมิ ด้วย Chart.js",
      "แผนที่จุดให้บริการน้ำดื่ม พัฒนาด้วย Leaflet.js แสดงตำแหน่งแบบแผนที่โลก",
      "ระบบยืนยันตัวตน 2 รูปแบบ: LINE LIFF (ผู้ใช้ทั่วไป) และ JWT (ผู้ดูแลระบบ)",
      "ระบบแจ้งปัญหาการใช้งาน พร้อมอัปโหลดรูปภาพผ่าน Cloudinary API",
      "ระบบจัดการเอกสารผลการตรวจสอบคุณภาพน้ำ (Lab Report)",
      "จัดการผู้ใช้งานตามสิทธิ์ (Admin, Lab Staff, User) แบ่งการเข้าถึงข้อมูลชัดเจน",
      "บันทึกประวัติการใช้งาน (Activity Logs) เพื่อตรวจสอบย้อนหลัง",
      "ระบบจัดการอุปกรณ์ IoT ลงทะเบียนและตรวจสอบสถานะเซ็นเซอร์",
      "RESTful API รองรับ 6 โมดูลหลัก (Authentication, Locations, Issues, Users, Devices, Logs)",
    ],

    highlights: [
      "Full-stack development (React + Node.js/Express)",
      "IoT integration with MQTT protocol",
      "LINE LIFF authentication",
      "Admin dashboard + User portal",
    ],
    highlights_th: [
      "พัฒนาแบบ Full-stack (React SPA + Express.js REST API) เชื่อมต่อกันสมบูรณ์",
      "การทำงานร่วมกับอุปกรณ์ IoT ผ่านโปรโตคอล MQTT เพื่อรับส่งข้อมูล Real-time",
      "การใช้ LINE Platform (LIFF SDK) เพื่อให้ผู้ใช้เข้าถึงระบบได้ง่าย",
      "ส่วนหน้าจอแยกการทำงานระหว่าง Admin Dashboard และ User Portal",
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
      "พัฒนา Backend REST API ด้วย Express.js ครอบคลุมการทำงานหลัก 6 โมดูล",
      "พัฒนา Frontend แบบ Single Page Application ด้วย React และ Chakra UI",
      "เชื่อมต่อและจัดการฐานข้อมูล Firebase Realtime Database",
      "ตั้งค่าระบบรับส่งข้อมูล IoT ผ่าน MQTT Broker",
      "เชื่อมต่อระบบยืนยันตัวตน LINE LIFF SDK และจัดการ JWT Token",
      "สร้างระบบจัดการข้อมูล (CRUD) สำหรับจุดให้บริการ ผู้ใช้ และอุปกรณ์ IoT",
      "พัฒนาระบบอัปโหลดรูปภาพเชื่อมต่อกับ Cloudinary",
      "Deploy ระบบ Frontend บน Vercel และ Backend บน Render",
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
ระบบทดสอบอัตโนมัติ (Automated Testing Framework) พัฒนาด้วย Playwright (TypeScript)
ครอบคลุมทั้ง API, UI และ End-to-End Testing มี Custom Scripts (Node.js) สำหรับควบคุม Pipeline
เชื่อมต่อ Google Sheets เพื่อรายงานผลการทดสอบอัตโนมัติ และรองรับ CI/CD Workflow ผ่าน GitHub Actions
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
      "API Testing - ชุดทดสอบครอบคลุม 6 โมดูลหลัก (Auth, Devices, Issues, Locations, Logs, Users)",
      "UI Testing - ทดสอบการทำงานของ Admin Dashboard และองค์ประกอบต่างๆ หน้าเว็บ",
      "E2E Testing - ทดสอบจำลองการใช้งานจริงของผู้ใช้ตาม User Flow ด้วย Page Object Model",
      "Multi-environment - รองรับการตั้งค่า Environment แยก (Dev, Staging, Production)",
      "Custom Pipeline - สคริปต์ Node.js สำหรับตรวจสอบความพร้อมระบบและรันเทส",
      "Result Export - สร้างไฟล์รายงานผลลัพธ์การทดสอบแบบ CSV และ JSON อัตโนมัติ",
      "Google Sheets Integration - อัปโหลดผลการทดสอบขึ้น Google Sheets ผ่าน API",
      "CI/CD Integration - ทำงานอัตโนมัติร่วมกับ GitHub Actions Workflow",
    ],

    highlights: [
      "6 API test suites + Admin UI + E2E tests",
      "Custom Node.js pipeline & export scripts",
      "Multi-environment configs (.env.production, .env.staging)",
      "Google Sheets auto-upload for test results",
    ],
    highlights_th: [
      "ครอบคลุมการทดสอบครบวงจร (Test Coverage) ทั้ง API, UI และ E2E",
      "ระบบ Automation แบบกำหนดเองด้วย Node.js (Pipeline & Export Scripts)",
      "จัดการ Environment Configuration ผ่านไฟล์ .env อย่างเป็นระบบ",
      "รายงานผลอัตโนมัติแบบ Real-time ขึ้น Google Sheets",
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
      "พัฒนา Pipeline Script (Node.js) เพื่อควบคุมลำดับการทำงานของชุดทดสอบ",
      "สร้าง Script สำหรับแปลงผลลัพธ์เป็นไฟล์ CSV/JSON (Data Formatting)",
      "เชื่อมต่อ API เพื่อส่งข้อมูลผลการทดสอบไปยัง Google Sheets",
      "ตั้งค่า Playwright ให้รองรับการทำงานหลาย Browser และหลาย Environment",
      "ติดตั้งและกำหนดค่า CI/CD Workflow บน GitHub Actions",
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
ออกแบบระบบจัดการสินค้าคงคลังร้านอาหาร (UX/UI Design) โดยใช้ Figma และ Adobe XD
เน้นการใช้งานจริงในธุรกิจร้านอาหาร (Restaurant Business Logic) เช่น การจัดการวัตถุดิบแยกประเภท,
ระบบติดตามวันหมดอายุ, และ Workflow การสั่งซื้อสินค้า (Purchase Order) ที่ใช้งานง่ายและลดความผิดพลาด
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
      "การจัดการหมวดหมู่สินค้า - ออกแบบรองรับการแยกประเภท อาหารสด, ของแห้ง, ผักผลไม้",
      "ระบบติดตามสต็อก - แสดงรายละเอียดสินค้า รูปภาพ หน่วยนับ และวันหมดอายุ",
      "การแจ้งเตือนวันหมดอายุ - ออกแบบระบบ Alert แจ้งเตือนล่วงหน้า 2 วัน",
      "การแบ่งสิทธิ์ผู้ใช้งาน - หน้าจอ UI แยกเฉพาะสำหรับ Admin และ Head Chef",
      "Purchase Order Workflow - ออกแบบขั้นตอนการสั่งซื้อ ตั้งแต่สร้างใบสั่งจนถึงรับของ",
      "ศูนย์แจ้งเตือน - รวบรวมรายการสินค้าใกล้หมดและใกล้หมดอายุไว้ในที่เดียว",
    ],

    highlights: [
      "Product catalog with images & categories",
      "Expiration tracking with 2-day alerts",
      "Purchase order management",
      "Role-based dashboards (Admin/Chef)",
    ],
    highlights_th: [
      "Product Catalog - ออกแบบการแสดงผลสินค้าในรูปแบบ Grid พร้อมรูปภาพ",
      "Expiration Tracking - ระบบแจ้งเตือนอัจฉริยะสำหรับสินค้าควบคุมอายุ",
      "PO Management - ออกแบบ Flow การจัดการใบสั่งซื้อให้เข้าใจง่าย",
      "Role-based Dashboard - แดชบอร์ดข้อมูลสรุปแยกตามหน้าที่ความรับผิดชอบ",
    ],

    responsibilities: [
      "Design database schema for products, categories, and orders",
      "Implement authentication & authorization system",
      "Build responsive UI for product management",
      "Create notification system for stock alerts",
      "Develop purchase order workflow",
    ],
    responsibilities_th: [
      "ออกแบบโครงสร้างฐานข้อมูล (Database Schema Flow) สำหรับสินค้าและคำสั่งซื้อ",
      "ออกแบบระบบการจัดการสิทธิ์ (Authentication Flow) ของแต่ละบทบาท",
      "สร้าง UI Mockups แบบ Responsive ด้วย Figma และ Adobe XD",
      "ออกแบบ User Experience (UX) สำหรับระบบแจ้งเตือนสินค้า",
      "วางแผนและออกแบบขั้นตอนการทำงาน (Workflow Design) ของระบบจัดซื้อ",
    ],

    links: { demo: "", repo: "" },
  },

  {
    slug: "pharmacy-store",
    title: "Pharmacy Store",
    title_th: "Pharmacy E-commerce System (PHP + MySQL)",
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
    description_th: `
แพลตฟอร์ม E-commerce ร้านขายยา พัฒนาด้วย PHP และ MySQL
มีระบบตะกร้าสินค้าแบบ Session Management, การจัดการคำสั่งซื้อครบวงจร
และระบบหลังบ้าน (Admin Dashboard) สำหรับบริหารจัดการสินค้าและลูกค้า
รองรับการแสดงผลทุกหน้าจอ (Responsive Web Design)
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
      "Product Catalog - จัดหมวดหมู่สินค้า (ยา, วิตามิน, เวชภัณฑ์) ให้ค้นหาง่าย",
      "Shopping Cart - ระบบตะกร้าสินค้า เพิ่ม/ลบ และแก้ไขจำนวนได้ทันที",
      "Order Management - จัดการสถานะคำสั่งซื้อตั้งแต่สั่งซื้อจนถึงจัดส่ง",
      "Search & Filter - ระบบค้นหาและกรองสินค้าตามประเภท",
      "Admin Dashboard - จัดการข้อมูลสินค้า คำสั่งซื้อ และสมาชิก ในหน้าเดียว",
      "Inventory Management - เพิ่มลบแก้ไขสินค้า พร้อมระบบอัปโหลดรูปภาพ",
      "Customer Management - ระบบสมาชิกและจัดการข้อมูลส่วนตัว",
      "Responsive Design - ออกแบบเว็บไซต์ให้ใช้งานได้ดีทั้งบนมือถือและคอมพิวเตอร์",
    ],

    highlights: [
      "Complete e-commerce flow (browse → cart → checkout)",
      "Admin panel for inventory & order management",
      "Category-based product organization",
      "Real-time cart total calculation",
    ],
    highlights_th: [
      "E-commerce Flow - ระบบซื้อขายสมบูรณ์แบบ (เลือกสินค้า → ตะกร้า → ชำระเงิน)",
      "Admin Panel - หน้าจัดการหลังบ้านที่ใช้งานง่าย",
      "Category Structure - โครงสร้างสินค้าที่เป็นระเบียบ",
      "Real-time Cart - คำนวณราคาสินค้าในตะกร้าทันที",
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
      "ออกแบบฐานข้อมูล MySQL สำหรับระบบ E-commerce (สินค้า, ออเดอร์, ลูกค้า)",
      "พัฒนาระบบตะกร้าสินค้าด้วย PHP Session",
      "สร้างหน้า Admin Dashboard เพื่อจัดการข้อมูลต่างๆ (CRUD Operations)",
      "เขียน HTML/CSS จัดหน้าเว็บแบบ Responsive Layout",
      "พัฒนาระบบ Checkout และประมวลผลคำสั่งซื้อ",
      "จัดการระบบไฟล์สำหรับอัปโหลดและแสดงผลรูปภาพสินค้า",
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
    //stack: "System Analyst • Software Tester",
    images: [`${import.meta.env.BASE_URL}images/p4-testcase.png`],
    role: ["System Analyst", "Software Tester"],

    description: `
Template set for UAT, test case design, and bug reporting
used in real projects to improve communication between
dev, tester, and business.
  `,
    description_th: `
ชุดเทมเพลตมาตรฐานสำหรับการทดสอบระบบ (Standardized Testing Templates)
ประกอบด้วย UAT, Test Case Design, และ Bug Reporting
ช่วยปรับปรุงการสื่อสารระหว่างทีม Developer, Tester และ Business
ออกแบบให้สามารถนำไปปรับใช้ซ้ำได้กับโปรเจกต์อื่นๆ (Reusable Structure)
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
      "Test Case Template - รูปแบบมาตรฐานพร้อมช่องระบุเกณฑ์การยอมรับ (Acceptance Criteria)",
      "Bug Report Format - ฟอร์มแจ้งบั๊กที่ระบุขั้นตอนชัดเจน (Steps, Expected/Actual Results)",
      "Regression Checklist - รายการตรวจสอบความพร้อมก่อนปล่อยระบบ (Pre-release)",
      "Reusable Structure - โครงสร้างที่ยืดหยุ่น ปรับใช้ได้กับหลากหลายทีมและโครงการ",
    ],

    highlights: [
      "Test case structure with acceptance criteria",
      "Bug report format (steps / expected vs actual)",
      "Regression checklist for releases",
    ],
    highlights_th: [
      "Test Case Structure - โครงสร้างที่เชื่อมโยงกับความต้องการทางธุรกิจ",
      "Bug Report Format - รูปแบบที่ช่วยให้ทีมพัฒนาแก้ไขปัญหาได้ง่ายขึ้น",
      "Regression Checklist - เครื่องมือช่วยตรวจสอบความครบถ้วนก่อนขึ้นระบบจริง",
    ],

    responsibilities: [
      "Design UAT structure",
      "Define acceptance criteria",
      "Create reusable test templates",
    ],
    responsibilities_th: [
      "ออกแบบโครงสร้างเอกสาร UAT (Document Architecture)",
      "กำหนดรูปแบบการเขียน Acceptance Criteria เพื่อความชัดเจน",
      "พัฒนาเทมเพลตการทดสอบที่นำกลับมาใช้ใหม่ได้ (Reusable Templates)",
    ],

    links: {
      demo: "https://docs.google.com/spreadsheets/d/13whAR8OIRtAWtpryLZRYJNYpehcxDzX5HF77uCd_tqA/edit?pli=1&gid=844435360#gid=844435360",
      repo: "",
    },
  },
];
