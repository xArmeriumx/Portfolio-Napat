import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/nav/Navbar.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Footer from "./components/layout/Footer";
import BrandLoader from "./components/ui/BrandLoader.jsx";

import ScrollToTop from "./components/utils/ScrollToTop.jsx";

// Deferred Startup / Lazy Loading (Sheet Part 3 Pattern 10)
const ProjectList = lazy(() => import("./pages/ProjectList.jsx"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail.jsx"));
const Notes = lazy(() => import("./pages/Notes.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

export default function App() {
  return (
    <div className="app">
      <ScrollToTop />
      <div className="gridBg" />
      <Navbar />
      <main className="main">
        <Suspense fallback={<BrandLoader />}>
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
