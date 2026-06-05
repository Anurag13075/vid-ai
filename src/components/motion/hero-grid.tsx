import { motion, useReducedMotion } from "framer-motion";

export function HeroGrid() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.35]">
      <motion.div
        className="absolute inset-[-50%] hero-grid-lines"
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
