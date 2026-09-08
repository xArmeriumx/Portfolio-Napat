"use client";

import { createContext, useContext } from "react";

const LanguageContext = createContext();

export function LanguageProvider({ children, initialLanguage = "en" }) {
  // URL is authoritative; a saved preference must not change crawler-visible language.
  const language = initialLanguage;

  const toggleLanguage = () => {
    const base = window.location.pathname.replace(/^\/th(?=\/|$)/, "") || "/";
    window.location.assign(language === "en" ? `/th${base === "/" ? "" : base}` : base);
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// Helper to get content based on language
// usage: t(obj, 'title') -> returns obj.title_th if lang is th, else obj.title
export function useTranslation() {
  const { language } = useLanguage();

  const getContent = (obj, field) => {
    if (!obj) return "";
    if (language === "th") {
      return obj[`${field}_th`] || obj[field] || "";
    }
    return obj[field] || "";
  };

  return { language, getContent, isThai: language === "th" };
}
