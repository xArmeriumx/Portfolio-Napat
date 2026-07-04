"use client";

import Navbar from "../nav/Navbar.jsx";
import Footer from "./Footer.jsx";
import ScrollToTop from "../utils/ScrollToTop.jsx";
import PageOverlay from "../ui/PageOverlay.jsx";
import { LanguageProvider } from "../../context/LanguageContext.jsx";
import { TransitionProvider, usePageTransition } from "../../context/TransitionContext.jsx";

function AppShellContent({ children }) {
  const { isOverlayVisible } = usePageTransition();

  return (
    <div className="app">
      <ScrollToTop />
      <PageOverlay isVisible={isOverlayVisible} />
      <div className="gridBg" />
      <Navbar />
      <main className="main">
        {children}
        <Footer />
      </main>
    </div>
  );
}

export default function AppShell({ children }) {
  return (
    <LanguageProvider>
      <TransitionProvider>
        <AppShellContent>{children}</AppShellContent>
      </TransitionProvider>
    </LanguageProvider>
  );
}
