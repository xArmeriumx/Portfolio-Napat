import { motion, AnimatePresence } from "framer-motion";
import BrandWordmark from "./BrandWordmark.jsx";

/**
 * PageOverlay — full-screen transition with centered logo (inline)
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
          className="fixed inset-0 z-[9999] w-full bg-[#f9fafb]"
        >
          <div className="flex h-full w-full items-center justify-center px-6">
            <motion.div
              className="flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <BrandWordmark title="Napatdev" compact />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
