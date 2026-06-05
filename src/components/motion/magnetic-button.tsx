import { motion, useReducedMotion } from "framer-motion";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function MagneticButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <button className={className} {...props}>
        {children}
      </button>
    );
  }
  return (
    <motion.button
      className={className}
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
