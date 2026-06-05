import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import {
  ArrowRight,
  Bot,
  Clapperboard,
  Clock,
  FileSearch,
  Film,
  Globe,
  Layers,
  Mic2,
  PenLine,
  Sparkles,
  Subtitles,
  Wand2,
  Youtube,
  Zap,
} from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import planeAfter from "@/assets/cinematic-plane.jpg";
import planeBefore from "@/assets/plain-plane.jpg";
import oceanImg from "@/assets/ocean-cinematic.jpg";
import egyptImg from "@/assets/egypt-cinematic.jpg";
import romeImg from "@/assets/rome-cinematic.jpg";
import tokyoImg from "@/assets/tokyo-cinematic.jpg";

const ease = [0.22, 1, 0.36, 1] as const;

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  dark,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  dark?: boolean;
}) {
  return (
    <Reveal className="text-center max-w-3xl mx-auto mb-14 md:mb-16 px-5">
      <div className={`text-caption mb-3 ${dark ? "text-[var(--accent-hover)]" : "text-[var(--accent)]"}`}>
        {eyebrow}
      </div>
      <h2 className={`text-display text-h1 mb-4 ${dark ? "text-white" : ""}`}>{title}</h2>
      {subtitle && (
        <p className={`text-[17px] leading-relaxed ${dark ? "text-white/60" : "text-[var(--text-secondary)]"}`}>
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}

/* ─── Stats strip ─── */
const STATS = [
  { value: "4m", label: "Avg. render time", suffix: "" },
  { value: "500", label: "Channels live", suffix: "+" },
  { value: "4K", label: "Max export", suffix: "" },
  { value: "15", label: "Script sections", suffix: "" },
] as const;

function AnimatedStat({ value, label, suffix }: { value: string; label: string; suffix: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0.6, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease }}
      className="text-center px-4"
    >
      <div className="text-display text-[clamp(36px,5vw,56px)] leading-none text-gradient-animated font-medium">
        {value}
        <span className="text-[0.5em] text-[var(--accent)]">{suffix}</span>
      </div>
      <div className="mt-2 text-[13px] text-[var(--text-secondary)] font-medium">{label}</div>
    </motion.div>
  );
}

export function StatsBar() {
  return (
    <section className="py-16 md:py-20 border-y border-[var(--border)] bg-white/60 backdrop-blur relative overflow-hidden">
      <div className="absolute inset-0 bento-mesh pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6">
        {STATS.map((s) => (
          <AnimatedStat key={s.label} {...s} />
        ))}
      </div>
    </section>
  );
}

/* ─── How it works ─── */
const STEPS = [
  { icon: PenLine, title: "Describe", desc: "One sentence or a full script — your call.", color: "#6c47ff" },
  { icon: FileSearch, title: "Research", desc: "Agents crawl sources and lock the narrative arc.", color: "#3ad1ff" },
  { icon: Mic2, title: "Voice & footage", desc: "TTS + 4K clips matched beat-by-beat.", color: "#f97316" },
  { icon: Clapperboard, title: "Ship", desc: "Timeline editor, one-click export to YouTube.", color: "#22c55e" },
] as const;

export function HowItWorks() {
  return (
    <section id="how" className="py-24 md:py-32 relative">
      <SectionHeader
        eyebrow="Workflow"
        title={
          <>
            Idea to upload in <span className="italic text-gradient-animated">four beats.</span>
          </>
        }
        subtitle="No timeline wrestling. No asset hunts. Just direction — VidRush assembles the rest."
      />
      <div className="max-w-6xl mx-auto px-5">
        <Stagger className="grid md:grid-cols-4 gap-5 relative">
          <div className="hidden md:block absolute top-[52px] left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <StaggerItem key={step.title}>
                <TiltCard intensity={10} className="bento-card bento-card--light p-6 h-full text-center group">
                  <motion.div
                    className="mx-auto mb-5 h-14 w-14 rounded-2xl flex items-center justify-center border border-[var(--border)] bg-white shadow-sm"
                    style={{ boxShadow: `0 12px 40px -12px ${step.color}55` }}
                    whileHover={{ scale: 1.08, rotate: 5 }}
                  >
                    <Icon className="h-6 w-6" style={{ color: step.color }} />
                  </motion.div>
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">0{i + 1}</span>
                  <h3 className="text-[18px] font-semibold mt-1 mb-2">{step.title}</h3>
                  <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed">{step.desc}</p>
                </TiltCard>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

/* ─── Main bento grid ─── */
export function BentoShowcase() {
  return (
    <section id="bento" className="py-24 md:py-36 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[900px] bg-[var(--accent)]/10 blur-[140px] rounded-full pointer-events-none" />
      <SectionHeader
        eyebrow="Production OS"
        title={
          <>
            Everything your studio needs — <span className="italic text-gradient-animated">one grid.</span>
          </>
        }
        subtitle="Hover any tile. Every module is a specialist agent, not a generic chat box."
      />
      <div className="max-w-7xl mx-auto px-5">
        <div className="bento-grid">
          {/* Hero tile — timeline preview */}
          <BentoCell span="lg" className="bento-card bento-card--dark min-h-[320px] md:min-h-[380px] p-0 overflow-hidden group">
            <div className="absolute inset-0">
              <img src={planeAfter} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/80 to-transparent" />
            </div>
            <div className="relative z-10 p-6 md:p-8 flex flex-col justify-end h-full min-h-[320px]">
              <span className="bento-tag w-fit mb-3">
                <Film className="h-3 w-3" /> Live timeline
              </span>
              <h3 className="text-display text-[28px] md:text-[36px] text-white leading-tight mb-2">
                Studio editor with <span className="italic text-[var(--accent-hover)]">real tracks</span>
              </h3>
              <p className="text-[14px] text-white/55 max-w-md">
                Captions, B-roll, VO, BGM, motion — color-coded layers you can drag, split, or regenerate.
              </p>
              <div className="mt-5 flex gap-2 flex-wrap">
                {["#3ad1ff", "#f97316", "#a78bfa", "#22c55e"].map((c) => (
                  <span key={c} className="h-2 w-8 rounded-full" style={{ background: c, opacity: 0.8 }} />
                ))}
              </div>
            </div>
          </BentoCell>

          {/* AI voices */}
          <BentoCell span="sm" className="bento-card bento-card--gradient p-6 flex flex-col justify-between group">
            <span className="bento-tag">
              <Mic2 className="h-3 w-3" /> 100+ voices
            </span>
            <div>
              <h3 className="text-[22px] font-semibold text-white mb-2">ElevenLabs-grade TTS</h3>
              <p className="text-[13px] text-white/70">Niche-tuned voices + your own clone.</p>
            </div>
            <div className="flex gap-1 items-end h-12 mt-4">
              {Array.from({ length: 24 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="flex-1 h-full min-h-[8px] rounded-full bg-white/40 origin-bottom"
                  animate={{ scaleY: [0.35, 1, 0.45] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.04, ease: "easeInOut" }}
                />
              ))}
            </div>
          </BentoCell>

          {/* Thumbnail */}
          <BentoCell span="sm" className="bento-card bento-card--light p-0 overflow-hidden min-h-[200px] group">
            <img src={romeImg} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="relative z-10 p-6 flex flex-col justify-end h-full min-h-[200px]">
              <span className="bento-tag bento-tag--dark w-fit mb-2">
                <Sparkles className="h-3 w-3" /> Thumbnails
              </span>
              <h3 className="text-[18px] font-semibold text-white">CTR-optimized covers</h3>
            </div>
          </BentoCell>

          {/* Research */}
          <BentoCell span="md" className="bento-card bento-card--light p-6 group">
            <span className="bento-tag mb-4">
              <Globe className="h-3 w-3" /> Deep research
            </span>
            <h3 className="text-[20px] font-semibold mb-2">Web-wide source mining</h3>
            <p className="text-[13px] text-[var(--text-secondary)] mb-4">
              Articles, competitor videos, and hooks ranked before a single line is written.
            </p>
            <div className="space-y-2">
              {[oceanImg, egyptImg, tokyoImg].map((src, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)]"
                  initial={{ x: -8, opacity: 0.7 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <img src={src} alt="" className="h-8 w-12 rounded object-cover" />
                  <div className="h-2 flex-1 rounded bg-[var(--border)] overflow-hidden">
                    <motion.div
                      className="h-full bg-[var(--accent)] rounded"
                      initial={{ width: "0%" }}
                      whileInView={{ width: `${70 - i * 15}%` }}
                      transition={{ duration: 1, delay: 0.3 + i * 0.15 }}
                      viewport={{ once: true }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </BentoCell>

          {/* Script */}
          <BentoCell span="md" className="bento-card bento-card--dark p-6">
            <span className="bento-tag mb-4">
              <PenLine className="h-3 w-3" /> Scriptwriter
            </span>
            <h3 className="text-[20px] font-semibold text-white mb-3">Approve every hook</h3>
            <div className="space-y-2 font-mono text-[12px]">
              <p className="text-white/40 line-through">Generic opener about history...</p>
              <motion.p
                className="text-white bg-[var(--accent)]/30 border border-[var(--accent)]/50 rounded-lg px-3 py-2"
                animate={{ boxShadow: ["0 0 0 rgba(108,71,255,0)", "0 0 24px rgba(108,71,255,0.35)", "0 0 0 rgba(108,71,255,0)"] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                → Skies became a war of innovation...
              </motion.p>
              <p className="text-white/50">Section 4 · pacing locked</p>
            </div>
          </BentoCell>

          {/* Style match */}
          <BentoCell span="md" className="bento-card bento-card--light p-6 overflow-hidden">
            <span className="bento-tag mb-3">
              <Wand2 className="h-3 w-3" /> Style match
            </span>
            <div className="flex gap-2 h-[120px] mb-3">
              <img src={planeBefore} alt="" className="flex-1 rounded-xl object-cover border border-[var(--border)]" />
              <img src={planeAfter} alt="" className="flex-1 rounded-xl object-cover border-2 border-[var(--accent)] shadow-[0_0_30px_-8px_var(--accent-glow)]" />
            </div>
            <p className="text-[13px] text-[var(--text-secondary)]">One reference frame → full grade + cut rhythm.</p>
          </BentoCell>

          {/* Speed */}
          <BentoCell span="wide" className="bento-card bento-card--ink p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="bento-tag bento-tag--accent mb-3">
                <Zap className="h-3 w-3" /> Cloud render
              </span>
              <h3 className="text-display text-[32px] md:text-[40px] text-white leading-tight">
                Close the tab. <span className="italic text-gradient-animated">Come back to a finished video.</span>
              </h3>
            </div>
            <div className="flex gap-8 shrink-0">
              {[
                { n: "~50", u: "min", l: "Generation" },
                { n: "<4", u: "min", l: "Final encode" },
                { n: "1", u: "click", l: "YouTube upload" },
              ].map((x) => (
                <div key={x.l} className="text-center">
                  <div className="text-[28px] font-semibold text-white tabular-nums">
                    {x.n}
                    <span className="text-[14px] text-[var(--accent-hover)]">{x.u}</span>
                  </div>
                  <div className="text-[11px] text-white/45 mt-1">{x.l}</div>
                </div>
              ))}
            </div>
          </BentoCell>
        </div>
      </div>
    </section>
  );
}

function BentoCell({
  children,
  span,
  className = "",
}: {
  children: ReactNode;
  span: "lg" | "sm" | "md" | "wide";
  className?: string;
}) {
  const spanClass = {
    lg: "bento-span-lg",
    sm: "bento-span-sm",
    md: "bento-span-md",
    wide: "bento-span-wide",
  }[span];
  return (
    <Reveal className={`${spanClass} h-full`}>
      <TiltCard
        intensity={span === "lg" ? 5 : 9}
        className={`h-full w-full rounded-[24px] overflow-hidden relative ${className}`}
      >
        {children}
      </TiltCard>
    </Reveal>
  );
}

/* ─── Agent pipeline bento ─── */
const AGENTS = [
  { name: "Researcher", icon: FileSearch, hue: "#3ad1ff" },
  { name: "Scriptwriter", icon: PenLine, hue: "#6c47ff" },
  { name: "Voice actor", icon: Mic2, hue: "#f97316" },
  { name: "Footage scout", icon: Film, hue: "#22c55e" },
  { name: "Editor", icon: Layers, hue: "#ec4899" },
  { name: "Motion GFX", icon: Sparkles, hue: "#a78bfa" },
  { name: "Thumbnail", icon: Bot, hue: "#fbbf24" },
  { name: "Director", icon: Clapperboard, hue: "#fff" },
] as const;

export function AgentBento() {
  return (
    <section className="py-24 md:py-32 ink-section relative overflow-hidden">
      <div className="absolute inset-0 dotted-grid opacity-20 pointer-events-none" />
      <SectionHeader
        dark
        eyebrow="Agent mesh"
        title={
          <>
            Eight specialists. <span className="italic text-[var(--accent-hover)]">One brain.</span>
          </>
        }
        subtitle="Each agent owns a lane — they hand off artifacts, never overwrite your intent."
      />
      <div className="max-w-7xl mx-auto px-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {AGENTS.map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.div
                key={a.name}
                initial={{ opacity: 0.7, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.5, ease }}
                viewport={{ once: true, margin: "-20px" }}
                whileHover={{ y: -6, transition: { type: "spring", stiffness: 400 } }}
                className="bento-card bento-card--glass p-5 rounded-2xl border border-white/10 group cursor-default"
              >
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center mb-3 border border-white/10 transition-transform group-hover:scale-110"
                  style={{ background: `${a.hue}22`, boxShadow: `0 8px 32px -8px ${a.hue}66` }}
                >
                  <Icon className="h-5 w-5" style={{ color: a.hue }} />
                </div>
                <div className="text-[14px] font-semibold text-white">{a.name}</div>
                <div className="text-[11px] text-white/40 mt-1 font-mono">agent.{i + 1}</div>
              </motion.div>
            );
          })}
        </div>
        <Reveal delay={0.2} className="mt-10 flex justify-center">
          <motion.div
            className="inline-flex items-center gap-3 px-5 py-3 rounded-full border border-white/15 bg-white/5 text-[13px] text-white/70"
            animate={{ boxShadow: ["0 0 0 rgba(108,71,255,0)", "0 0 40px rgba(108,71,255,0.25)", "0 0 0 rgba(108,71,255,0)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            All agents synced · Deep Video V1 orchestration
            <ArrowRight className="h-4 w-4 text-[var(--accent-hover)]" />
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Formats + outputs ─── */
const FORMATS = [
  { title: "Documentary", desc: "6–40 min deep dives", icon: Film },
  { title: "Top 10 / Listicle", desc: "Punchy ranked formats", icon: Layers },
  { title: "Explainer", desc: "Science, tech, history", icon: Globe },
  { title: "True crime", desc: "Mystery pacing built-in", icon: Subtitles },
] as const;

export function OutputFormats() {
  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-white to-[#f5f3ff]">
      <SectionHeader
        eyebrow="Formats"
        title={
          <>
            Built for <span className="italic text-gradient-animated">YouTube-native</span> storytelling.
          </>
        }
      />
      <Stagger className="max-w-6xl mx-auto px-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FORMATS.map((f) => {
          const Icon = f.icon;
          return (
            <StaggerItem key={f.title}>
              <div className="bento-card bento-card--light p-6 h-full hover:border-[var(--accent)] transition-colors group">
                <Icon className="h-8 w-8 text-[var(--accent)] mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-[17px] mb-1">{f.title}</h3>
                <p className="text-[13px] text-[var(--text-secondary)]">{f.desc}</p>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}

/* ─── Testimonials bento ─── */
const QUOTES = [
  { q: "We shipped 12 videos in our first week. The timeline editor is shockingly real.", who: "Marcus T.", role: "History channel · 240K subs" },
  { q: "Style match alone saved us 6 hours of grading per upload.", who: "Priya K.", role: "Agency · 8 faceless brands" },
  { q: "Script approval before render is the feature I didn't know I needed.", who: "Jordan L.", role: "True crime · 89K subs" },
] as const;

export function Testimonials() {
  return (
    <section className="py-24 md:py-32">
      <SectionHeader eyebrow="Creators" title={<>Loved by channels that ship daily.</>} />
      <div className="max-w-7xl mx-auto px-5 grid md:grid-cols-3 gap-5">
        {QUOTES.map((t, i) => (
          <Reveal key={t.who} delay={i * 0.08}>
            <TiltCard intensity={6} className="bento-card bento-card--light p-8 h-full flex flex-col">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <span key={j} className="text-[#fbbf24] text-sm">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-[16px] leading-relaxed flex-1">&ldquo;{t.q}&rdquo;</p>
              <div className="mt-6 pt-6 border-t border-[var(--border)]">
                <div className="font-semibold text-[14px]">{t.who}</div>
                <div className="text-[12px] text-[var(--text-muted)]">{t.role}</div>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ─── Vs traditional ─── */
export function VsTraditional() {
  const rows = [
    { label: "Time per 10-min video", old: "2–5 days", vr: "< 1 hour" },
    { label: "Tools required", old: "5+ apps", vr: "One tab" },
    { label: "Stock footage", old: "Manual search", vr: "Auto-ranked 4K" },
    { label: "Script control", old: "After edit", vr: "Before render" },
  ] as const;
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bento-mesh pointer-events-none" />
      <SectionHeader
        eyebrow="Compare"
        title={
          <>
            Your old stack vs <span className="italic text-gradient-animated">VidRush.</span>
          </>
        }
      />
      <Reveal className="max-w-3xl mx-auto px-5">
        <div className="rounded-3xl border border-[var(--border)] bg-white overflow-hidden shadow-[0_40px_100px_-40px_var(--accent-glow)]">
          <div className="grid grid-cols-3 text-[12px] font-medium uppercase tracking-wider bg-[var(--bg-surface)] border-b border-[var(--border)]">
            <div className="p-4 text-[var(--text-muted)]" />
            <div className="p-4 text-center text-[var(--text-secondary)]">Traditional</div>
            <div className="p-4 text-center text-[var(--accent)] bg-[var(--accent-soft)]">VidRush</div>
          </div>
          {rows.map((r, i) => (
            <motion.div
              key={r.label}
              className="grid grid-cols-3 border-b border-[var(--border)] last:border-0 text-[14px]"
              initial={{ opacity: 0.8, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
            >
              <div className="p-4 font-medium text-[var(--ink)]">{r.label}</div>
              <div className="p-4 text-center text-[var(--text-muted)]">{r.old}</div>
              <div className="p-4 text-center font-semibold text-[var(--accent)] bg-[var(--accent-soft)]/50">{r.vr}</div>
            </motion.div>
          ))}
        </div>
      </Reveal>
      <Reveal delay={0.15} className="mt-10 flex flex-wrap justify-center gap-6 text-[13px] text-[var(--text-secondary)]">
        <span className="inline-flex items-center gap-2">
          <Youtube className="h-4 w-4" /> YouTube-ready exports
        </span>
        <span className="inline-flex items-center gap-2">
          <Clock className="h-4 w-4" /> 24/5 live support
        </span>
        <span className="inline-flex items-center gap-2">
          <Sparkles className="h-4 w-4" /> Deep Video V1 model
        </span>
      </Reveal>
    </section>
  );
}

/* ─── Logo wall / integrations ─── */
export function IntegrationsStrip() {
  const logos = ["Pexels", "Storyblocks", "ElevenLabs", "FFmpeg", "YouTube", "Pond5"];
  const doubled = [...logos, ...logos];
  return (
    <section className="py-14 border-y border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
      <p className="text-center text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-8">
        Powered by best-in-class pipelines
      </p>
      <div className="flex w-max marquee-track gap-16 px-4">
        {doubled.map((l, i) => (
          <span
            key={i}
            className="text-[15px] font-semibold text-[var(--text-secondary)]/60 hover:text-[var(--accent)] transition-colors whitespace-nowrap"
          >
            {l}
          </span>
        ))}
      </div>
    </section>
  );
}
