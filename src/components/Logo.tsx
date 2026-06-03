import { Link } from "@tanstack/react-router";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[#3a1d99] flex items-center justify-center shadow-[0_0_24px_var(--accent-glow)]">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="currentColor">
          <path d="M5 4l14 8-14 8V4z" />
        </svg>
      </div>
      <span className="text-[17px] font-semibold tracking-tight">
        Vid<span className="text-[var(--accent)]">Rush</span>
      </span>
    </Link>
  );
}
