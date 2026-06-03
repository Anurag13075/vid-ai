import { createFileRoute, Link } from "@tanstack/react-router";
import { TopicInput } from "@/components/TopicInput";
import { Logo } from "@/components/Logo";
import {
  FileSearch,
  PenLine,
  Mic2,
  Film,
  Wand2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VidRush — Turn any topic into a faceless YouTube video" },
      {
        name: "description",
        content:
          "Type a topic. Get a fully produced, faceless long-form YouTube video — scripted, voiced, edited, and exported. Powered by VidRush AI.",
      },
      { property: "og:title", content: "VidRush — AI video generation" },
      {
        property: "og:description",
        content: "One topic. One click. A fully produced faceless YouTube video.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: FileSearch, name: "Researcher", desc: "Pulls angles, facts, and the strongest narrative hook for your topic." },
  { icon: PenLine, name: "Writer", desc: "Drafts a 15-section script tuned for retention and YouTube watch time." },
  { icon: Mic2, name: "Voice Over", desc: "Natural neural voices — choose male or female, multi-language ready." },
  { icon: Film, name: "Footage Collection", desc: "Sources HD b-roll per scene and downloads in parallel." },
  { icon: Wand2, name: "Motion Design", desc: "Burns in subtitles, title cards, keyword pills, and CTA overlays." },
  { icon: Sparkles, name: "Video Editor", desc: "Cuts, crossfades, mixes audio, and exports a web-optimized MP4." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-white">
      {/* nav */}
      <header className="sticky top-0 z-30 backdrop-blur bg-[var(--bg-base)]/70 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-7 text-[13px] text-[var(--text-secondary)]">
            <a href="#pipeline" className="hover:text-white transition-colors">Pipeline</a>
            <a href="#stats" className="hover:text-white transition-colors">Showcase</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">Docs</a>
          </nav>
          <button className="text-[13px] px-3.5 py-1.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors font-medium">
            Sign in
          </button>
        </div>
      </header>

      {/* hero */}
      <section className="relative">
        <div className="absolute inset-0 grain pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-5 pt-24 pb-32 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 text-[12px] text-[var(--text-secondary)] px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)]/60 mb-7 animate-fade-in">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] animate-pulse" />
            6-stage AI pipeline · render in under 4 minutes
          </div>
          <h1 className="text-hero max-w-3xl animate-fade-up">
            Transform your ideas <br />
            <span className="bg-gradient-to-r from-white via-[var(--accent-hover)] to-white bg-clip-text text-transparent">
              into videos.
            </span>
          </h1>
          <p
            className="mt-5 text-[19px] text-[var(--text-secondary)] max-w-xl animate-fade-up"
            style={{ animationDelay: "80ms" }}
          >
            One topic. One click. A fully produced faceless YouTube video — scripted, voiced, edited, exported.
          </p>
          <div className="mt-10 w-full animate-fade-up" style={{ animationDelay: "160ms" }}>
            <TopicInput />
          </div>
        </div>
      </section>

      {/* pipeline */}
      <section id="pipeline" className="border-t border-[var(--border)] bg-[var(--bg-surface)]/50">
        <div className="max-w-5xl mx-auto px-5 py-24">
          <div className="text-center mb-14">
            <div className="text-caption text-[var(--accent)] mb-3">The Pipeline</div>
            <h2 className="text-h1">Six specialists. One render.</h2>
            <p className="mt-3 text-[var(--text-secondary)] max-w-xl mx-auto">
              Each stage is a dedicated agent. You watch every step happen live — no black box.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] divide-y divide-[var(--border)] overflow-hidden">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.name}
                  className="flex items-center gap-5 p-5 hover:bg-[var(--bg-hover)]/50 transition-colors group"
                >
                  <div className="h-10 w-10 rounded-lg bg-[var(--bg-hover)] border border-[var(--border)] flex items-center justify-center text-[var(--accent-hover)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[15px] font-semibold">{f.name}</div>
                    <div className="text-[13px] text-[var(--text-secondary)] mt-0.5">{f.desc}</div>
                  </div>
                  <span className="text-[11px] font-mono text-[var(--text-muted)] tabular-nums">
                    0{i + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* stats */}
      <section id="stats" className="border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-5 py-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { v: "10,000+", l: "Videos generated" },
            { v: "4 min", l: "Avg render time" },
            { v: "500+", l: "YouTube channels powered" },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-7"
            >
              <div className="text-[40px] font-semibold tracking-tight bg-gradient-to-br from-white to-[var(--accent-hover)] bg-clip-text text-transparent">
                {s.v}
              </div>
              <div className="text-[13px] text-[var(--text-secondary)] mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* cta */}
      <section className="border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-5 py-24 text-center">
          <h2 className="text-h1 mb-4">Ready to ship a channel?</h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Drop a topic. Watch six agents build your video in real time.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors font-medium"
          >
            Start a render
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] py-8 text-center text-[12px] text-[var(--text-muted)]">
        © {new Date().getFullYear()} VidRush AI. Demo build.
      </footer>
    </div>
  );
}
