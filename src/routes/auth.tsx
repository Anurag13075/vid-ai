import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { ShieldCheck, Sparkles, Zap, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign In · VidRush" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { user, signIn, isLoading } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect home
  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#06060c] flex items-center justify-center relative overflow-hidden px-4">
      {/* Background glows */}
      <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[#6c47ff]/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#a78bfa]/15 blur-[100px] pointer-events-none" />
      {/* Grid texture */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='g' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='rgba(255,255,255,0.03)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E\")",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="relative rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_40px_100px_-30px_rgba(108,71,255,0.4)] overflow-hidden p-8 md:p-10">
          {/* Top shine */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo variant="light" />
          </div>

          {/* Headline */}
          <div className="text-center mb-8">
            <h1 className="text-[28px] md:text-[32px] font-bold text-white tracking-tight leading-tight mb-3">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-[#6c47ff] via-[#a78bfa] to-[#c4b5fd] bg-clip-text text-transparent">
                VidRush
              </span>
            </h1>
            <p className="text-[15px] text-white/50 leading-relaxed">
              Sign in to start creating AI-powered faceless videos instantly.
            </p>
          </div>

          {/* Trust badges */}
          <div className="flex justify-center gap-6 mb-8">
            {[
              { icon: <ShieldCheck className="h-3.5 w-3.5" />, label: "Secure" },
              { icon: <Zap className="h-3.5 w-3.5" />, label: "Instant" },
              { icon: <Sparkles className="h-3.5 w-3.5" />, label: "AI-powered" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-1.5 text-[12px] text-white/40">
                <span className="text-[#a78bfa]">{b.icon}</span>
                {b.label}
              </div>
            ))}
          </div>

          {/* Google Sign-In Button */}
          <motion.button
            id="google-signin-btn"
            onClick={() => signIn()}
            disabled={isLoading}
            whileHover={isLoading ? undefined : { scale: 1.02, y: -2 }}
            whileTap={isLoading ? undefined : { scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white text-[#1a1a2e] font-semibold text-[15px] shadow-[0_16px_48px_-12px_rgba(255,255,255,0.25)] hover:shadow-[0_20px_60px_-12px_rgba(255,255,255,0.35)] transition-all duration-300 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#6c47ff]" />
            ) : (
              <>
                {/* Google logo */}
                <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                  <path
                    d="M47.532 24.552c0-1.636-.132-3.23-.388-4.776H24v9.046h13.216c-.568 3.066-2.296 5.664-4.892 7.41v6.16h7.922c4.636-4.268 7.286-10.556 7.286-17.84z"
                    fill="#4285F4"
                  />
                  <path
                    d="M24 48c6.636 0 12.196-2.196 16.26-5.964l-7.922-6.16c-2.2 1.474-5.008 2.342-8.338 2.342-6.408 0-11.83-4.328-13.77-10.144H2.016v6.36C6.064 42.532 14.468 48 24 48z"
                    fill="#34A853"
                  />
                  <path
                    d="M10.23 28.074A14.937 14.937 0 019.45 24c0-1.414.244-2.788.78-4.074v-6.36H2.016A23.967 23.967 0 000 24c0 3.862.924 7.516 2.016 10.434l8.214-6.36z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M24 9.536c3.614 0 6.858 1.244 9.412 3.686l7.074-7.074C36.186 2.196 30.636 0 24 0 14.468 0 6.064 5.468 2.016 13.566l8.214 6.36C12.17 13.864 17.592 9.536 24 9.536z"
                    fill="#EA4335"
                  />
                </svg>
              </>
            )}
            {isLoading ? "Signing you in…" : "Continue with Google"}
            {!isLoading && (
              <span className="ml-auto text-[#6c47ff] opacity-0 group-hover:opacity-100 transition-opacity text-[12px]">
                →
              </span>
            )}
          </motion.button>

          <p className="mt-6 text-center text-[12px] text-white/25 leading-relaxed">
            By continuing, you agree to VidRush's{" "}
            <span className="text-white/40 hover:text-white/60 cursor-pointer transition-colors">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="text-white/40 hover:text-white/60 cursor-pointer transition-colors">
              Privacy Policy
            </span>
            .
          </p>
        </div>
      </motion.div>
    </div>
  );
}
