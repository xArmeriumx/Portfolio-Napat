import { motion, AnimatePresence } from "framer-motion";

/**
 * PageOverlay
 * Full-screen overlay สี #f9fafb ไหลเข้า-ออกแนวตั้ง
 * ปิดทับระหว่าง page transition เพื่อซ่อนรอยต่อ
 *
 * Flow:
 *   Slide in from bottom  → [y: 100% → 0]  (350ms)
 *   Slide out to top      → [y: 0 → -100%]  (350ms)
 */
export default function PageOverlay({ isVisible }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="page-overlay"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{
            duration: 0.35,
            ease: [0.76, 0, 0.24, 1],
          }}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "#f9fafb",
            zIndex: 9999,
            borderTop: "2px solid #e5e7eb",
          }}
        />
      )}
    </AnimatePresence>
  );
}
