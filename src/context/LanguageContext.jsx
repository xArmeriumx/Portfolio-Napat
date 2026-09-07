"use client";

import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export function LanguageProvider({ children, initialLanguage = "en" }) {
  // URL locale wins on first paint (SSR + crawler correctness);
  // the saved preference only restores on the default locale tree.
  const [language, setLanguage] = useState(initialLanguage);

  useEffect(() => {
    const saved = window.localStorage.getItem("language");
    if (saved && initialLanguage === "en") setLanguage(saved);
  }, [initialLanguage]);

  useEffect(() => {
    window.localStorage.setItem("language", language);
    // Optional: Add/remove 'th' class to body for specific global styling if needed
    if (language === "th") {
      document.documentElement.lang = "th";
    } else {
      document.documentElement.lang = "en";
    }
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "th" : "en"));
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
