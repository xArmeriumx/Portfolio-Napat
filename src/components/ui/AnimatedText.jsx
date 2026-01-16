import { useLanguage } from "../../context/LanguageContext.jsx";

export default function AnimatedText({
  children,
  className = "",
  as: Component = "span",
}) {
  const { language } = useLanguage();

  return (
    <Component
      key={language}
      className={`animate-blur-in inline-block ${className}`}
    >
      {children}
    </Component>
  );
}
