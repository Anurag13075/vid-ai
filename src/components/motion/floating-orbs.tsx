import { motion, useReducedMotion } from "framer-motion";

const ORBS = [
  { className: "left-[8%] top-[20%] h-32 w-32 bg-[#6c47ff]/40", delay: 0 },
  { className: "right-[10%] top-[30%] h-24 w-24 bg-[#ec4899]/35", delay: 1.2 },
  { className: "left-[40%] bottom-[15%] h-40 w-40 bg-[#8b6aff]/30", delay: 2.4 },
] as const;

export function FloatingOrbs() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {ORBS.map((o, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl orb-float ${o.className}`}
          style={{ animationDelay: `${o.delay}s` }}
          animate={{ y: [0, -24, 0], x: [0, 12, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 7 + i, repeat: Infinity, ease: "easeInOut", delay: o.delay }}
        />
      ))}
    </div>
  );
}
