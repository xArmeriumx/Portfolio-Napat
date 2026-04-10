import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/nav/Navbar.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/utils/ScrollToTop.jsx";
import PageOverlay from "./components/ui/PageOverlay.jsx";
import { TransitionProvider, usePageTransition } from "./context/TransitionContext.jsx";

// Deferred Startup / Lazy Loading (Sheet Part 3 Pattern 10)
// หน้า Home/About โหลดทันที (first impression)
// ส่วน Notes/ProjectDetail/ProjectList defer เพราะ user ต้อง navigate ไปเอง
const ProjectList = lazy(() => import("./pages/ProjectList.jsx"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail.jsx"));
const Notes = lazy(() => import("./pages/Notes.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

// Skeleton สั้นๆ สำหรับ lazy-loaded pages (ซ่อนอยู่หลัง overlay อยู่แล้ว)
function PageSkeleton() {
  return (
    <div
      style={{
        minHeight: "60vh",
        backgroundColor: "#f9fafb",
      }}
    />
  );
}

// AppContent แยกออกมาเพื่อใช้ usePageTransition ได้
// (ต้องอยู่ใน TransitionProvider ถึงจะเรียก hook ได้)
function AppContent() {
  const { isOverlayVisible } = usePageTransition();
  const location = useLocation();

  return (
    <>
      {/* Overlay animation ปิดทับระหว่าง page transition */}
      <PageOverlay isVisible={isOverlayVisible} />

      <div className="gridBg" />
      <Navbar />
      <main className="main">
        <Suspense fallback={<PageSkeleton />}>
          <AnimatePresence mode="sync">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/projects" element={<ProjectList />} />
              <Route path="/projects/:slug" element={<ProjectDetail />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/notes/:slug" element={<Notes />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
        <Footer />
      </main>
    </>
  );
}

export default function App() {
  return (
    <div className="app">
      <ScrollToTop />
      <TransitionProvider>
        <AppContent />
      </TransitionProvider>
    </div>
  );
}
