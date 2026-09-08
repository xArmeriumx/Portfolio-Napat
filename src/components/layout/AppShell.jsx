"use client";

import Analytics from "../analytics/Analytics";
import Navbar from "../nav/Navbar.jsx";
import Footer from "./Footer.jsx";
import ScrollToTop from "../utils/ScrollToTop.jsx";
import PageOverlay from "../ui/PageOverlay.jsx";
import { LanguageProvider } from "../../context/LanguageContext.jsx";
import { TransitionProvider, usePageTransition } from "../../context/TransitionContext.jsx";

function AppShellContent({ children, pageLocales }) {
  const { isOverlayVisible } = usePageTransition();

  return (
    <div className="app">
      <ScrollToTop />
      <PageOverlay isVisible={isOverlayVisible} />
      <div className="gridBg" />
      <Navbar pageLocales={pageLocales} />
      <main className="main">
        {children}
        <Footer />
        <Analytics />
      </main>
    </div>
  );
}

export default function AppShell({ children, locale = "en", pageLocales = {} }) {
  return (
    <LanguageProvider initialLanguage={locale}>
      <TransitionProvider>
        <AppShellContent pageLocales={pageLocales}>{children}</AppShellContent>
      </TransitionProvider>
    </LanguageProvider>
  );
}
