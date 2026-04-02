import { useState, useEffect } from 'react';

const BRAND = 'NAPATDEV';

/**
 * Branded Loading Spinner
 * ตัวอักษร "NAPATDEV" ค่อยๆ fill สีทีละตัวแบบ loop
 */
export default function BrandLoader() {
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => {
        // วนจาก -1 → 0 → 1 → ... → 7 → -1 (reset) → loop
        if (prev >= BRAND.length - 1) return -1;
        return prev + 1;
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        {/* Brand Text */}
        <div className="flex gap-[2px] select-none" aria-label="Loading">
          {BRAND.split('').map((char, i) => (
            <span
              key={i}
              className="text-2xl font-black tracking-wider transition-all duration-300 ease-out"
              style={{
                color: i <= activeIndex ? '#dc2626' : '#e5e7eb',
                textShadow: i <= activeIndex ? '0 0 12px rgba(220, 38, 38, 0.25)' : 'none',
                transform: i === activeIndex ? 'translateY(-2px) scale(1.05)' : 'translateY(0) scale(1)',
              }}
            >
              {char}
            </span>
          ))}
        </div>

        {/* Progress bar underneath */}
        <div className="w-24 h-[3px] bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 rounded-full transition-all duration-150 ease-out"
            style={{ width: `${((activeIndex + 1) / BRAND.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
