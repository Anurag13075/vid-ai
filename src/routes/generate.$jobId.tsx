import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { PipelineStepper } from "@/components/PipelineStepper";
import { ScriptPreview } from "@/components/ScriptPreview";
import { ClipGrid } from "@/components/ClipGrid";
import { Waveform } from "@/components/Waveform";
import { RenderProgress } from "@/components/RenderProgress";
import { Timeline } from "@/components/Timeline";
import { useJob } from "@/lib/usePipeline";
import { getJob } from "@/lib/pipeline";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/generate/$jobId")({
  head: () => ({ meta: [{ title: "Generating · VidRush" }] }),
  component: GeneratePage,
});

/* ── Mini auth avatar for generate header ── */
function NavAvatar() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
      >
        <img src={user.avatar} alt={user.name} className="h-6 w-6 rounded-full ring-1 ring-[#6c47ff]/50" />
        <span className="hidden sm:block text-[12px] text-white/70 font-medium">{user.name.split(" ")[0]}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-white/10 bg-[#0d0d16]/95 backdrop-blur-xl shadow-xl z-50 overflow-hidden p-1"
          >
            <div className="px-3 py-2 border-b border-white/8 mb-0.5">
              <div className="text-[12px] font-semibold text-white truncate">{user.name}</div>
            </div>
            <button
              onClick={() => { signOut(); setOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-[12px] text-white/50 hover:text-white hover:bg-white/8 transition-all"
            >
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GeneratePage() {
  const { jobId } = Route.useParams();
  const navigate = useNavigate();
  const job = useJob(jobId);

  useEffect(() => {
    if (!getJob(jobId)) {
      navigate({ to: "/" });
    }
  }, [jobId, navigate]);

  useEffect(() => {
    if (job?.stage === "done") {
      const t = setTimeout(() => navigate({ to: "/result/$jobId", params: { jobId } }), 1200);
      return () => clearTimeout(t);
    }
  }, [job?.stage, jobId, navigate]);

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--text-muted)]">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="dark-app min-h-screen flex flex-col">
      <header className="h-14 border-b border-[var(--border)] flex items-center px-5 justify-between shrink-0">
        <div className="flex items-center gap-5">
          <Logo variant="light" />
          <div className="h-5 w-px bg-[var(--border)]" />
          <div className="text-[13px] text-[var(--text-secondary)] truncate max-w-[420px]">
            <span className="text-[var(--text-muted)]">Topic:</span>{" "}
            <span className="text-white">{job.topic}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            {job.stage === "done" ? "Complete" : "Live render"}
          </div>
          <NavAvatar />
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* sidebar */}
        <aside className="w-[320px] shrink-0 border-r border-[var(--border)] p-6 overflow-y-auto">
          <div className="text-caption text-[var(--text-muted)] mb-5">Pipeline</div>
          <PipelineStepper stage={job.stage} message={job.message} />
        </aside>

        {/* main */}
        <main className="flex-1 overflow-y-auto p-8">
          <StageView jobId={jobId} />
        </main>
      </div>

      <Timeline clips={job.clips} stage={job.stage} />
    </div>
  );
}

function StageView({ jobId }: { jobId: string }) {
  const job = useJob(jobId);
  if (!job) return null;

  if (job.stage === "researching") {
    return (
      <div className="max-w-2xl">
        <Header eyebrow="Researcher" title="Gathering angles & sources" />
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-8 font-mono text-[14px] text-[var(--text-secondary)]">
          <TypingLines
            lines={[
              "→ querying knowledge graph...",
              "→ scoring narrative hooks (15 candidates)...",
              "→ selecting strongest opening...",
              "→ outlining 15-section arc...",
            ]}
          />
        </div>
      </div>
    );
  }

  if (job.stage === "writing" && job.script) {
    return (
      <div className="max-w-5xl">
        <Header eyebrow="Writer" title={job.script.title} subtitle={`${job.script.sections.length} of 15 sections drafted`} />
        <ScriptPreview script={job.script} />
      </div>
    );
  }

  if (job.stage === "voiceover") {
    return (
      <div className="max-w-2xl">
        <Header eyebrow="Voice Over" title={`${job.voice === "female" ? "af_heart" : "am_echo"} · Kokoro TTS`} subtitle="Synthesizing audio track" />
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-8">
          <Waveform />
          <div className="mt-6 flex items-center justify-between text-[12px] text-[var(--text-secondary)] font-mono">
            <span>{job.progress}%</span>
            <span>≈ 00:60 audio</span>
            <span>WAV → MP3</span>
          </div>
        </div>
      </div>
    );
  }

  if (job.stage === "footage" && job.clips) {
    const ready = job.clips.filter((c) => c.status === "ready").length;
    return (
      <div className="max-w-5xl">
        <Header
          eyebrow="Footage Collection"
          title="Pexels HD clips"
          subtitle={`${ready} of ${job.clips.length} downloaded · ${job.message}`}
        />
        <ClipGrid clips={job.clips} />
      </div>
    );
  }

  if (job.stage === "rendering" && job.renderSteps) {
    return (
      <div className="max-w-3xl">
        <Header eyebrow="Render Engine" title="FFmpeg pipeline running" subtitle="1920×1080 · H.264 · AAC" />
        <RenderProgress steps={job.renderSteps} progress={job.renderProgress ?? 0} />
      </div>
    );
  }

  if (job.stage === "done" && job.videoUrl) {
    return (
      <div className="max-w-3xl">
        <Header eyebrow="Done" title="Render complete" subtitle="Redirecting to result..." />
        <video
          src={job.videoUrl}
          className="w-full rounded-xl border border-[var(--border)] aspect-video bg-black animate-fade-in"
          controls
          autoPlay
          muted
        />
      </div>
    );
  }

  if (job.stage === "error") {
    return (
      <div className="max-w-xl">
        <Header eyebrow="Error" title="Pipeline failed" subtitle={job.message} />
      </div>
    );
  }

  return null;
}

function Header({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <div className="text-caption text-[var(--accent)] mb-2">{eyebrow}</div>
      <h1 className="text-h1 text-white">{title}</h1>
      {subtitle && <p className="mt-2 text-[14px] text-[var(--text-secondary)]">{subtitle}</p>}
    </div>
  );
}

function TypingLines({ lines }: { lines: string[] }) {
  return (
    <div className="space-y-2">
      {lines.map((l, i) => (
        <div key={i} className="animate-fade-up" style={{ animationDelay: `${i * 350}ms` }}>
          {l}
          {i === lines.length - 1 && <span className="caret ml-1">▌</span>}
        </div>
      ))}
    </div>
  );
}
