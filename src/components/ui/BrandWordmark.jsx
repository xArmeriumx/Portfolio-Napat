/**
 * BrandWordmark — โลโก้หลักของเว็บ (favicon + wordmark บรรทัดเดียว)
 */
export default function BrandWordmark({
  className = "",
  wordmarkClassName = "",
  compact = false,
  iconOnly = false,
  title = "Napatdev — Home",
}) {
  const iconSize = compact ? "h-8 w-8" : "h-10 w-10";
  const svgSize = compact ? "h-6 w-[88px]" : "h-7 w-[108px]";

  if (iconOnly) {
    return (
      <img
        src="/favicon.png"
        alt={title}
        className={`${iconSize} object-contain mix-blend-multiply flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
      role="img"
      aria-label={title}
    >
      <img
        src="/favicon.png"
        alt=""
        aria-hidden="true"
        className={`${iconSize} object-contain flex-shrink-0 mix-blend-multiply`}
      />
      <svg
        viewBox="0 0 120 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${svgSize} text-gray-900 flex-shrink-0 max-w-[calc(100vw-3rem)] ${wordmarkClassName}`}
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
      >
        <text
          x="0"
          y="24"
          fill="currentColor"
          fontFamily="'Space Grotesk', ui-sans-serif, sans-serif"
          fontSize={compact ? "18" : "20"}
          fontWeight="800"
          letterSpacing="-0.03em"
        >
          Napatdev
        </text>
      </svg>
    </div>
  );
}
