import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { useJob } from "@/lib/usePipeline";
import { getJob } from "@/lib/pipeline";
import { Check, Copy, Download, RotateCcw, Sparkles } from "lucide-react";

export const Route = createFileRoute("/result/$jobId")({
  head: () => ({ meta: [{ title: "Your video · VidRush" }] }),
  component: ResultPage,
});

function ResultPage() {
  const { jobId } = Route.useParams();
  const navigate = useNavigate();
  const job = useJob(jobId);

  useEffect(() => {
    if (!getJob(jobId)) navigate({ to: "/" });
  }, [jobId, navigate]);

  if (!job || !job.videoUrl || !job.script) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--text-muted)]">
        Loading...
      </div>
    );
  }

  const stats = [
    { l: "Duration", v: "01:00" },
    { l: "Clips", v: `${job.script.sections.length}` },
    { l: "Voice", v: job.voice === "female" ? "af_heart" : "am_echo" },
    { l: "Resolution", v: "1920×1080" },
  ];

  return (
    <div className="dark-app min-h-screen">
      <header className="h-14 border-b border-[var(--border)] flex items-center px-5 justify-between">
        <Logo />
        <Link
          to="/"
          className="text-[13px] text-[var(--text-secondary)] hover:text-white transition-colors flex items-center gap-2"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          New video
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-12">
        <div className="flex items-center gap-2 text-[12px] text-[var(--success)] mb-4 animate-fade-in">
          <Sparkles className="h-3.5 w-3.5" />
          Render complete · ready to publish
        </div>
        <h1 className="text-h1 mb-2 animate-fade-up">{job.script.title}</h1>
        <p className="text-[var(--text-secondary)] mb-8 animate-fade-up" style={{ animationDelay: "60ms" }}>
          {job.script.description}
        </p>

        <video
          src={job.videoUrl}
          controls
          poster=""
          className="w-full aspect-video rounded-2xl border border-[var(--border)] bg-black shadow-[0_30px_100px_-30px_var(--accent-glow)] animate-fade-up"
          style={{ animationDelay: "120ms" }}
        />

        <div className="mt-5 flex flex-wrap gap-2">
          {stats.map((s) => (
            <div
              key={s.l}
              className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[12px]"
            >
              <span className="text-[var(--text-muted)]">{s.l}: </span>
              <span className="text-white font-medium">{s.v}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={job.videoUrl}
            download={`vidrush-${jobId}.mp4`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors font-medium"
          >
            <Download className="h-4 w-4" />
            Download MP4
          </a>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[var(--border-active)] bg-transparent hover:bg-[var(--bg-hover)] transition-colors font-medium"
          >
            <RotateCcw className="h-4 w-4" />
            Generate another
          </Link>
        </div>

        <section className="mt-14 space-y-6">
          <h2 className="text-h2">YouTube-ready metadata</h2>
          <CopyBlock label="Title" value={job.script.title} />
          <CopyBlock label="Description" value={job.script.description} multiline />
        </section>

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
      <div className={`text-[14px] text-white ${multiline ? "leading-relaxed" : "truncate"}`}>
        {value}
      </div>
    </div>
  );
}
