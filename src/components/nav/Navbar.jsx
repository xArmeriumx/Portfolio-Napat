import { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function Navbar() {
  const { language, toggleLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Lock scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const t = {
    home: "Home",
    about: "About",
    projects: "Projects",
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          className={`flex items-center gap-2 z-[60] group transition-opacity ${
            isOpen
              ? "opacity-0 pointer-events-none duration-0 md:opacity-100 md:pointer-events-auto"
              : "opacity-100 duration-300"
          }`}
        >
          <img
            src="/favicon.png"
            alt="Napat-Dev Logo"
            className="h-10 w-auto transition-transform duration-300 group-hover:scale-110 mix-blend-multiply"
          />
          <span className="text-xl font-extrabold text-gray-900 tracking-tight transition-colors group-hover:text-red-700 hidden sm:block">
            Napat-Dev();
          </span>
        </Link>

        {/* Hamburger Toggle (Mobile) */}
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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `text-sm font-bold uppercase tracking-wide transition-all py-1 border-b-2 ${
                isActive
                  ? "text-gray-900 border-red-600"
                  : "text-gray-600 border-transparent hover:text-gray-900"
              }`
            }
          >
            {t.home}
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `text-sm font-bold uppercase tracking-wide transition-all py-1 border-b-2 ${
                isActive
                  ? "text-gray-900 border-red-600"
                  : "text-gray-600 border-transparent hover:text-gray-900"
              }`
            }
          >
            {t.about}
          </NavLink>
          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `text-sm font-bold uppercase tracking-wide transition-all py-1 border-b-2 ${
                isActive
                  ? "text-gray-900 border-red-600"
                  : "text-gray-600 border-transparent hover:text-gray-900"
              }`
            }
          >
            {t.projects}
          </NavLink>

          <button
            onClick={toggleLanguage}
            className="px-3 py-1 text-xs font-bold rounded-md border-2 border-gray-200 text-gray-700 hover:border-red-600 hover:text-red-600 transition-all uppercase tracking-wide bg-gray-50"
            aria-label="Toggle language"
          >
            {language === "en" ? "TH" : "EN"}
          </button>
        </nav>

        {/* Mobile Navigation Overlay */}
        {/* Mobile Navigation Drawer */}

        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
            isOpen
              ? "opacity-100 visible"
              : "opacity-0 invisible pointer-events-none"
          }`}
          onClick={() => setIsOpen(false)}
        />

        {/* Drawer */}
        <div
          className={`fixed top-0 right-0 h-full w-[80%] max-w-sm bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out md:hidden flex flex-col ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Drawer Header (Logo Left, Close Button Right) */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
            {/* Logo inside Drawer */}
            <div className="flex items-center gap-2">
              <img
                src="/favicon.png"
                alt="Logo"
                className="h-8 w-auto mix-blend-multiply"
              />
              <span className="text-lg font-bold text-gray-900">
                Napat-Dev();
              </span>
            </div>
            {/* Close button is handled by the main toggle button which is z-60 */}
          </div>

          {/* Drawer Content */}
          <nav className="flex-1 px-8 py-12 flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <NavLink
                to="/"
                end
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `text-3xl font-bold font-['Prompt'] transition-colors duration-200 ${
                    isActive
                      ? "text-red-600 pl-4 border-l-4 border-red-600"
                      : "text-gray-900 border-l-4 border-transparent hover:text-red-500 hover:pl-2"
                  }`
                }
              >
                {t.home}
              </NavLink>
              <NavLink
                to="/about"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `text-3xl font-bold font-['Prompt'] transition-colors duration-200 ${
                    isActive
                      ? "text-red-600 pl-4 border-l-4 border-red-600"
                      : "text-gray-900 border-l-4 border-transparent hover:text-red-500 hover:pl-2"
                  }`
                }
              >
                {t.about}
              </NavLink>
              <NavLink
                to="/projects"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `text-3xl font-bold font-['Prompt'] transition-colors duration-200 ${
                    isActive
                      ? "text-red-600 pl-4 border-l-4 border-red-600"
                      : "text-gray-900 border-l-4 border-transparent hover:text-red-500 hover:pl-2"
                  }`
                }
              >
                {t.projects}
              </NavLink>
            </div>

            {/* Separator */}
            <div className="w-12 h-1 bg-gray-100 rounded-full my-2"></div>

            {/* Additional Options */}
            <div className="flex flex-col gap-6 items-start">
              <button
                onClick={() => {
                  toggleLanguage();
                  // setIsOpen(false); // Optional: keep open to see change
                }}
                className="text-lg font-medium text-gray-500 hover:text-gray-900 flex items-center gap-2"
              >
                <span className="uppercase tracking-wider">Language:</span>
                <span
                  className={`font-bold ${
                    language === "en" ? "text-red-600" : "text-gray-400"
                  }`}
                >
                  EN
                </span>
                <span className="text-gray-300">/</span>
                <span
                  className={`font-bold ${
                    language === "th" ? "text-red-600" : "text-gray-400"
                  }`}
                >
                  TH
                </span>
              </button>
            </div>

            {/* Footer / Contact in Drawer */}
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
