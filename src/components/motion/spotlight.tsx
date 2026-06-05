import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import type { ReactNode } from "react";

export function Spotlight({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const background = useMotionTemplate`radial-gradient(600px circle at ${x}px ${y}px, rgba(108,71,255,0.14), transparent 65%)`;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - rect.left);
        y.set(e.clientY - rect.top);
      }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background }}
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
