import { motion } from "framer-motion";

export default function ScrollReveal({
  children,
  width = "fit-content",
  delay = 0,
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: delay, ease: "easeOut" }}
      style={{ width, willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}
