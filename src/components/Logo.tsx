import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";

export function Logo({ variant = "auto" }: { variant?: "auto" | "light" | "dark" }) {
  const reduce = useReducedMotion();
  const textCls =
    variant === "light"
      ? "text-white"
      : variant === "dark"
        ? "text-[var(--ink)]"
        : "text-[var(--ink)]";

  const mark = (
    <div className="relative h-8 w-8 rounded-xl bg-gradient-to-br from-[var(--accent)] via-[#7a55ff] to-[#3a1d99] flex items-center justify-center shadow-[0_8px_24px_-8px_var(--accent-glow)]">
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" fill="currentColor">
        <path d="M6 4.5v15l13-7.5L6 4.5z" />
      </svg>
      <span className="absolute -inset-px rounded-xl ring-1 ring-white/15 pointer-events-none" />
      {!reduce && (
        <motion.span
          className="absolute inset-0 rounded-xl bg-[var(--accent)]/30"
          animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );

  return (
    <Link to="/" className="flex items-center gap-2 group">
      {reduce ? mark : (
        <motion.div whileHover={{ scale: 1.06, rotate: -3 }} transition={{ type: "spring", stiffness: 400 }}>
          {mark}
        </motion.div>
      )}
      <span className={`text-[17px] font-semibold tracking-tight ${textCls} group-hover:opacity-90 transition-opacity`}>
        Vid<span className="text-gradient-animated">Rush</span>
      </span>
    </Link>
  );
}
