export const projects = [
  {
    slug: "clean-water-monitoring",
    title: "Clean Water Monitoring (FYP)",
    //stack: "React • Chart.js • MQTT • Firebase",
    image: `${import.meta.env.BASE_URL}images/p1-clean-water.jpg`,
    role: [
      // "React",
      // "Chart.js",
      // "MQTT",
      // "Firebase",
      // "ChakraUI",
      // "LeafletJS",
      // "IoT Technology",
    ],

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
    slug: "uat-testkit",
    title: "UAT / Test Case & Bug Report Template",
    stack: "System Analyst • Software Tester",
    // ✅ แก้ให้เข้ากับ GitHub Pages เหมือนกัน
    image: `${import.meta.env.BASE_URL}images/p2-uat.png`,
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
