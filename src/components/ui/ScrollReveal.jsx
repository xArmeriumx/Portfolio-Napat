"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

export default function ScrollReveal({
  children,
  width = "fit-content",
  delay = 0,
  className = "",
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const reduceMotion = useReducedMotion();

  return (
    <div ref={ref} style={{ width }} className={className}>
      <motion.div
        className={className}
        initial={false}
        animate={
          reduceMotion
            ? { transform: "none" }
            : {
                transform: isInView ? "translate3d(0, 0, 0)" : "translate3d(0, 14px, 0)",
              }
        }
        transition={{
          duration: 0.45,
          delay: isInView ? delay : 0,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ willChange: reduceMotion ? "auto" : "transform" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
