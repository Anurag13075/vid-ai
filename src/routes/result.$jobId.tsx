import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/Logo";
import { useJob } from "@/lib/usePipeline";
import { getJob } from "@/lib/pipeline";
import { useAuth } from "@/lib/auth";
import {
  Check,
  Copy,
  Download,
  Loader2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";

export const Route = createFileRoute("/result/$jobId")({
  head: () => ({ meta: [{ title: "Your video · VidRush" }] }),
  component: ResultPage,
});

/* ── Auth avatar (mini) ── */
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

/* ── Video Player with controls ── */
function VideoPlayer({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  function togglePlay() {
    const v = ref.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  }

  function handleTimeUpdate() {
    const v = ref.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const v = ref.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * v.duration;
  }

  function toggleMute() {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  return (
    <div className="group relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black shadow-[0_30px_100px_-30px_rgba(108,71,255,0.5)]">
      <video
        ref={ref}
        src={src}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setPlaying(false)}
        playsInline
      />

      {/* Overlay controls */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
        {/* Progress bar */}
        <div
          className="w-full h-1.5 bg-white/20 rounded-full mb-3 cursor-pointer"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-gradient-to-r from-[#6c47ff] to-[#a78bfa] rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="h-9 w-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all"
          >
            {playing ? <Pause className="h-4 w-4 text-white" /> : <Play className="h-4 w-4 text-white fill-white" />}
          </button>
          <button
            onClick={toggleMute}
            className="h-9 w-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all"
          >
            {muted ? <VolumeX className="h-4 w-4 text-white" /> : <Volume2 className="h-4 w-4 text-white" />}
          </button>
          <span className="ml-auto text-[11px] font-mono text-white/50">
            {Math.round(progress)}% played
          </span>
        </div>
      </div>

      {/* Center play button when paused */}
      {!playing && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="h-16 w-16 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center hover:bg-white/25 transition-all hover:scale-105">
            <Play className="h-7 w-7 text-white fill-white ml-1" />
          </div>
        </button>
      )}
    </div>
  );
}

/* ── Main Result Page ── */
function ResultPage() {
  const { jobId } = Route.useParams();
  const navigate = useNavigate();
  const job = useJob(jobId);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!getJob(jobId)) navigate({ to: "/" });
  }, [jobId, navigate]);

  if (!job || !job.videoUrl || !job.script) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--text-muted)] bg-[#06060c]">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const videoSrc = job.videoUrl; // pipeline already resolves userVideoUrl → videoUrl

  async function handleDownload() {
    setDownloading(true);
    try {
      // Blob fetch ensures cross-origin videos actually download (not just open)
      const response = await fetch(videoSrc);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vidrush-${jobId}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: direct anchor download
      const a = document.createElement("a");
      a.href = videoSrc;
      a.download = `vidrush-${jobId}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setDownloading(false);
    }
  }

  const stats = [
    { l: "Duration", v: "01:00" },
    { l: "Clips", v: `${job.script.sections.length}` },
    { l: "Voice", v: job.voice === "female" ? "af_heart" : "am_echo" },
    { l: "Resolution", v: "1920×1080" },
    ...(job.userVideoUrl ? [{ l: "Source", v: "Your file" }] : []),
  ];

  return (
    <div className="dark-app min-h-screen bg-[#06060c]">
      {/* ── Header ── */}
      <header className="h-14 border-b border-[var(--border)] bg-[#06060c]/80 backdrop-blur-xl flex items-center px-5 justify-between sticky top-0 z-30">
        <Logo variant="light" />
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-[13px] text-[var(--text-secondary)] hover:text-white transition-colors flex items-center gap-2"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New video
          </Link>
          <NavAvatar />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-12">
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-[12px] text-[var(--success)] mb-4"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Render complete · ready to publish
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-h1 mb-2"
        >
          {job.script.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[var(--text-secondary)] mb-8"
        >
          {job.script.description}
        </motion.p>

        {/* Video player */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <VideoPlayer src={videoSrc} />
        </motion.div>

        {/* Stats chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-5 flex flex-wrap gap-2"
        >
          {stats.map((s) => (
            <div
              key={s.l}
              className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[12px]"
            >
              <span className="text-[var(--text-muted)]">{s.l}: </span>
              <span className="text-white font-medium">{s.v}</span>
            </div>
          ))}
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <button
            id="download-mp4-btn"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #6c47ff, #8b6aff)" }}
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {downloading ? "Preparing…" : "Download MP4"}
          </button>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[var(--border-active)] bg-transparent hover:bg-[var(--bg-hover)] transition-colors font-medium"
          >
            <RotateCcw className="h-4 w-4" />
            Generate another
          </Link>
        </motion.div>

        {/* YouTube metadata */}
        <section className="mt-14 space-y-6">
          <h2 className="text-h2">YouTube-ready metadata</h2>
          <CopyBlock label="Title" value={job.script.title} />
          <CopyBlock label="Description" value={job.script.description} multiline />
        </section>

        {/* Script breakdown */}
        <section className="mt-14 space-y-4">
          <h2 className="text-h2">Script breakdown</h2>
          <div className="rounded-xl border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden">
            {job.script.sections.map((s) => (
              <div key={s.id} className="flex gap-4 p-4 items-center hover:bg-[var(--bg-card)] transition-colors">
                <span className="text-[11px] font-mono text-[var(--text-muted)] w-6 tabular-nums">
                  {String(s.id).padStart(2, "0")}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--accent)]/15 text-[var(--accent-hover)] font-medium shrink-0">
                  {s.visual_keyword}
                </span>
                <span className="text-[13.5px] text-[var(--text-secondary)] flex-1">
                  {s.narration}
                </span>
                <span className="text-[11px] font-mono text-[var(--text-muted)] tabular-nums">
                  {s.duration}s
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function CopyBlock({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-caption text-[var(--text-muted)]">{label}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="text-[11px] text-[var(--text-secondary)] hover:text-white flex items-center gap-1.5 transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-[var(--success)]" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className={`text-[14px] text-white ${multiline ? "leading-relaxed" : "truncate"}`}>{value}</div>
    </div>
  );
}
