import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ScrollNextHint
 * ตัวบอกใบ้ที่ก้นหน้า — แสดงเมื่อ user scroll ใกล้ถึงก้นหน้า
 * animated arrow ↓ พร้อม label บอก section ถัดไป
 */
export default function ScrollNextHint({ label = "" }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkPosition = () => {
      const scrollBuffer = 80; // px จากก้นหน้า
      const atBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - scrollBuffer;

      // หน้าสั้นกว่า viewport → แสดงเลย
      const isShortPage =
        document.documentElement.scrollHeight <= window.innerHeight + 10;

      setIsVisible(atBottom || isShortPage);
    };

    checkPosition(); // ตรวจสอบทันทีตอน mount
    window.addEventListener("scroll", checkPosition, { passive: true });
    window.addEventListener("resize", checkPosition, { passive: true });

    return () => {
      window.removeEventListener("scroll", checkPosition);
      window.removeEventListener("resize", checkPosition);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1 pointer-events-none select-none"
        >
          {label && (
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              {label}
            </span>
          )}
          {/* Bouncing arrow */}
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
          >
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#9ca3af"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
