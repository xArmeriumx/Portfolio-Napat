"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../../context/LanguageContext.jsx";
import BrandWordmark from "../ui/BrandWordmark.jsx";

const navItems = [
  { href: "/", label: "Home", labelTh: "หน้าแรก", exact: true },
  { href: "/about", label: "About", labelTh: "เกี่ยวกับฉัน" },
  { href: "/projects", label: "Projects", labelTh: "โปรเจค" },
  { href: "/notes", label: "Notes", labelTh: "โน้ตความรู้" },
];

function isActivePath(pathname, href, exact = false) {
  if (exact) return pathname === href;
  if (href === "/about" && pathname === "/contact") return true;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function DesktopNavLink({ href, label, labelTh, exact }) {
  const pathname = usePathname();
  const isActive = isActivePath(pathname, href, exact);

  return (
    <Link
      href={href}
      prefetch
      aria-label={`${label} / ${labelTh}`}
      title={`${label} / ${labelTh}`}
      className={`text-sm font-bold uppercase tracking-wide transition-all py-1 border-b-2 ${
        isActive
          ? "text-gray-900 border-red-600"
          : "text-gray-600 border-transparent hover:text-gray-900"
      }`}
    >
      {label}
    </Link>
  );
}

function MobileNavLink({ href, label, labelTh, exact, onClick }) {
  const pathname = usePathname();
  const isActive = isActivePath(pathname, href, exact);

  return (
    <Link
      href={href}
      prefetch
      onClick={onClick}
      aria-label={`${label} / ${labelTh}`}
      title={`${label} / ${labelTh}`}
      className={`text-3xl font-bold font-['Prompt'] transition-colors duration-200 ${
        isActive
          ? "text-red-600 pl-4 border-l-4 border-red-600"
          : "text-gray-900 border-l-4 border-transparent hover:text-red-500 hover:pl-2"
      }`}
    >
      {label}
    </Link>
  );
}

export default function Navbar() {
  const { language, toggleLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className={`flex items-center z-[60] group transition-opacity ${
            isOpen
              ? "opacity-0 pointer-events-none duration-0 md:opacity-100 md:pointer-events-auto"
              : "opacity-100 duration-300"
          }`}
          aria-label="Napatdev home"
        >
          <BrandWordmark
            className="transition-transform duration-300 group-hover:scale-[1.02]"
            compact
          />
        </Link>

        <button
          className="md:hidden z-[60] p-2 text-gray-900 focus:outline-none border border-gray-200 rounded-lg hover:bg-gray-50 bg-white"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          <div className="w-5 h-4 relative flex flex-col justify-between">
            <span
              className={`w-full h-0.5 bg-current transition-all duration-300 ${
                isOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`w-full h-0.5 bg-current transition-all duration-300 ${
                isOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`w-full h-0.5 bg-current transition-all duration-300 ${
                isOpen ? "-rotate-45 -translate-y-1.5" : ""
              }`}
            />
          </div>
        </button>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <DesktopNavLink key={item.href} {...item} />
          ))}

          <button
            onClick={toggleLanguage}
            className="group relative h-7 overflow-hidden text-sm font-bold uppercase tracking-wide border-b-2 border-transparent hover:border-gray-900 transition-colors"
            aria-label="Toggle language"
          >
            <div
              className={`flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                language === "th" ? "-translate-y-1/2" : "translate-y-0"
              }`}
            >
              <span className="h-7 flex items-center text-gray-900">EN</span>
              <span className="h-7 flex items-center text-gray-900">TH</span>
            </div>
          </button>
        </nav>

        <div
          className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
            isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
          }`}
          onClick={() => setIsOpen(false)}
        />

        <div
          className={`fixed top-0 right-0 h-full w-[80%] max-w-sm bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out md:hidden flex flex-col ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
            <BrandWordmark className="text-gray-900" compact />
          </div>

          <nav className="flex-1 px-8 py-12 flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              {navItems.map((item) => (
                <MobileNavLink
                  key={item.href}
                  {...item}
                  onClick={() => setIsOpen(false)}
                />
              ))}
            </div>

            <div className="w-12 h-1 bg-gray-100 rounded-full my-2" />

            <div className="flex flex-col gap-6 items-start">
              <button
                onClick={toggleLanguage}
                className="text-lg font-medium text-gray-500 hover:text-gray-900 flex items-center gap-2"
              >
                <span className="uppercase tracking-wider">Language:</span>
                <span
                  className={`font-bold ${language === "en" ? "text-red-600" : "text-gray-400"}`}
                >
                  EN
                </span>
                <span className="text-gray-300">/</span>
                <span
                  className={`font-bold ${language === "th" ? "text-red-600" : "text-gray-400"}`}
                >
                  TH
                </span>
              </button>
            </div>

            <div className="mt-auto pt-8">
              <p className="text-sm text-gray-400 font-medium mb-2 uppercase tracking-widest">
                Get in touch
              </p>
              <a
                href="mailto:napat.pamornsut@gmail.com"
                className="text-gray-900 font-bold hover:text-red-600 transition-colors"
              >
                napat.pamornsut@gmail.com
              </a>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
