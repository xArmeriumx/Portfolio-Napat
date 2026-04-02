import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/nav/Navbar.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Footer from "./components/layout/Footer";

import ScrollToTop from "./components/utils/ScrollToTop.jsx";

// Deferred Startup / Lazy Loading (Sheet Part 3 Pattern 10)
// หน้า Home/About โหลดทันที (first impression) 
// ส่วน Notes/ProjectDetail/ProjectList defer เพราะ user ต้อง navigate ไปเอง
const ProjectList = lazy(() => import("./pages/ProjectList.jsx"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail.jsx"));
const Notes = lazy(() => import("./pages/Notes.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

// Minimal loading skeleton สำหรับ lazy-loaded pages
function PageSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-6 h-6 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin"></div>
    </div>
  );
}

export default function App() {
  return (
    <div className="app">
      <ScrollToTop />
      <div className="gridBg" />
      <Navbar />
      <main className="main">
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/notes/:slug" element={<Notes />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Footer />
      </main>
    </div>
  );
}
