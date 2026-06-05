import { useState, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  ChevronDown,
  Clock,
  Film,
  Mic,
  Music,
  Paperclip,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { createJob } from "@/lib/pipeline";
import { FloatingOrbs } from "@/components/motion/floating-orbs";
import { TiltCard } from "@/components/motion/tilt-card";
import { useMounted } from "@/hooks/use-mounted";

const LENGTHS = [
  { value: "short", label: "6–8 min" },
  { value: "medium", label: "10–12 min" },
  { value: "long", label: "15+ min" },
] as const;

const VOICES = [
  { value: "female", label: "Female · af_heart" },
  { value: "male", label: "Male · am_echo" },
] as const;

const MODELS = ["Deep Video V1", "Cinematic V2 · Beta"] as const;

const SUGGESTIONS = [
  "5 dark secrets of the Roman Empire",
  "Why the deep ocean still terrifies scientists",
  "How Tokyo became the world's quietest megacity",
  "The lost technology of ancient Egypt",
];

function FileChip({
  name,
  type,
  onRemove,
}: {
  name: string;
  type: "video" | "audio";
  onRemove: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium max-w-[180px] ${
        type === "video"
          ? "bg-[#6c47ff]/10 border-[#6c47ff]/30 text-[#a78bfa]"
          : "bg-[#0ea5e9]/10 border-[#0ea5e9]/30 text-[#38bdf8]"
      }`}
    >
      {type === "video" ? (
        <Film className="h-3 w-3 shrink-0" />
      ) : (
        <Music className="h-3 w-3 shrink-0" />
      )}
      <span className="truncate">{name}</span>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </motion.div>
  );
}

export function TopicInput() {
  const navigate = useNavigate();
  const mounted = useMounted();
  const [topic, setTopic] = useState("");
  const [focused, setFocused] = useState(false);
  const [length, setLength] = useState<(typeof LENGTHS)[number]["value"]>("medium");
  const [voice, setVoice] = useState<(typeof VOICES)[number]["value"]>("female");
  const [model, setModel] = useState<string>(MODELS[0]);
  const [submitting, setSubmitting] = useState(false);

  // File uploads
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const reduce = useReducedMotion();

  function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) setVideoFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  }

  function handleAudioChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setAudioFile(file);
    e.target.value = "";
  }

  function removeVideo(idx: number) {
    setVideoFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  function submit(t: string) {
    const final = t.trim();
    if (!final || submitting) return;
    setSubmitting(true);
    const id = createJob({ topic: final, voice, length, videoFiles, audioFile });
    navigate({ to: "/generate/$jobId", params: { jobId: id } });
  }

  const hasText = topic.trim().length > 0;
  const hasFiles = videoFiles.length > 0 || audioFile !== null;

  const card = (
    <div
      className={`prompt-shell w-full max-w-3xl mx-auto transition-shadow duration-500 ${
        focused ? "prompt-shell--active" : ""
      }`}
    >
      <FloatingOrbs />
      <div className="prompt-inner relative overflow-hidden">
        <div className="prompt-shine pointer-events-none" aria-hidden />
        <div className="prompt-grid-bg pointer-events-none" aria-hidden />

        <div className="relative z-10 p-4 md:p-5">
          {/* Top toolbar */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="prompt-live-badge">
                <span className="prompt-live-dot" />
                Studio live
              </span>
              <Dropdown
                icon={<Sparkles className="h-3.5 w-3.5" />}
                value={model}
                options={[...MODELS]}
                onSelect={(v) => setModel(v)}
              />
              <Dropdown
                icon={<Clock className="h-3.5 w-3.5" />}
                value={LENGTHS.find((l) => l.value === length)!.label}
                options={LENGTHS.map((l) => l.label)}
                onSelect={(label) => {
                  const v = LENGTHS.find((l) => l.label === label)!.value;
                  setLength(v);
                }}
              />
              <Dropdown
                icon={<Mic className="h-3.5 w-3.5" />}
                value={VOICES.find((v) => v.value === voice)!.label.split(" · ")[0]}
                options={VOICES.map((v) => v.label)}
                onSelect={(label) => {
                  const v = VOICES.find((x) => x.label === label)!.value;
                  setVoice(v);
                }}
              />
            </div>
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-white/35">
              <Zap className="h-3 w-3 text-amber-400" />
              {hasFiles ? "~Real MP4" : "~Demo mode"}
            </span>
          </div>

          {/* Textarea */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(topic);
            }}
            className="relative"
          >
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder='Describe your video — e.g. "5 aircraft that changed WW2 forever"…'
              rows={3}
              className="prompt-textarea w-full min-h-[88px] md:min-h-[100px] bg-transparent border-0 outline-none resize-none leading-relaxed"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(topic);
                }
              }}
            />
            {!hasText && <span className="prompt-caret pointer-events-none" aria-hidden />}

            {/* ── Media upload section ── */}
            <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2">
              {/* File chips */}
              <AnimatePresence>
                {(videoFiles.length > 0 || audioFile) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap gap-1.5 pb-2"
                  >
                    {videoFiles.map((f, i) => (
                      <FileChip
                        key={`v${i}-${f.name}`}
                        name={f.name}
                        type="video"
                        onRemove={() => removeVideo(i)}
                      />
                    ))}
                    {audioFile && (
                      <FileChip
                        name={audioFile.name}
                        type="audio"
                        onRemove={() => setAudioFile(null)}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action row */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {/* Hidden inputs */}
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    multiple
                    className="hidden"
                    onChange={handleVideoChange}
                  />
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleAudioChange}
                  />

                  {/* Video upload button */}
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    title="Add video clips"
                    className={`flex items-center gap-1.5 h-9 px-3 rounded-xl text-[11px] font-medium border transition-all ${
                      videoFiles.length > 0
                        ? "bg-[#6c47ff]/15 border-[#6c47ff]/40 text-[#a78bfa]"
                        : "text-[#9a9aa8] hover:text-white border-white/[0.06] hover:border-white/15 hover:bg-white/[0.06]"
                    }`}
                  >
                    <Film className="h-3.5 w-3.5" />
                    {videoFiles.length > 0 ? `${videoFiles.length} clip${videoFiles.length > 1 ? "s" : ""}` : "Add clips"}
                  </button>

                  {/* Audio upload button */}
                  <button
                    type="button"
                    onClick={() => audioInputRef.current?.click()}
                    title="Add voice-over audio"
                    className={`flex items-center gap-1.5 h-9 px-3 rounded-xl text-[11px] font-medium border transition-all ${
                      audioFile
                        ? "bg-[#0ea5e9]/15 border-[#0ea5e9]/40 text-[#38bdf8]"
                        : "text-[#9a9aa8] hover:text-white border-white/[0.06] hover:border-white/15 hover:bg-white/[0.06]"
                    }`}
                  >
                    <Music className="h-3.5 w-3.5" />
                    {audioFile ? "Audio ✓" : "Add audio"}
                  </button>

                  {!hasFiles && (
                    <span className="hidden sm:inline text-[10px] text-white/25 font-mono">
                      or use demo clips
                    </span>
                  )}
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={!hasText || submitting}
                  whileHover={reduce ? undefined : { scale: 1.04 }}
                  whileTap={reduce ? undefined : { scale: 0.96 }}
                  className={`prompt-submit group flex items-center gap-2.5 pl-5 pr-4 py-3 rounded-2xl font-semibold text-[14px] transition-all ${
                    hasText ? "prompt-submit--ready" : "opacity-40 cursor-not-allowed"
                  }`}
                  aria-label="Generate video"
                >
                  <span>{submitting ? "Launching…" : "Generate video"}</span>
                  <span className="h-9 w-9 rounded-xl bg-white/15 group-hover:bg-white/25 flex items-center justify-center">
                    <ArrowUp className="h-4 w-4 text-white" />
                  </span>
                </motion.button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full perspective-[1400px]">
      {reduce ? (
        card
      ) : (
        <TiltCard intensity={14} className="w-full">
          {mounted ? (
            <motion.div
              initial={{ opacity: 0.85, y: 16, rotateX: 4 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {card}
            </motion.div>
          ) : (
            card
          )}
        </TiltCard>
      )}

      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        {SUGGESTIONS.map((s, i) => (
          <motion.button
            key={s}
            type="button"
            initial={mounted && !reduce ? { opacity: 0.7, y: 6 } : false}
            animate={mounted && !reduce ? { opacity: 1, y: 0 } : undefined}
            transition={{ delay: 0.2 + i * 0.05 }}
            whileHover={reduce ? undefined : { y: -3, scale: 1.02 }}
            onClick={() => submit(s)}
            className="suggestion-chip text-[12.5px] px-4 py-2 rounded-full"
          >
            {s}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function Dropdown({
  icon,
  value,
  options,
  onSelect,
}: {
  icon: React.ReactNode;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[12px] text-[#e8e8f0] hover:text-white hover:bg-white/[0.1] hover:border-[var(--accent)]/40 transition-all"
      >
        <span className="text-[var(--accent-hover)]">{icon}</span>
        {value}
        <ChevronDown className={`h-3 w-3 opacity-60 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 min-w-[200px] rounded-xl bg-[#14141c]/95 border border-white/10 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.6)] z-30 overflow-hidden backdrop-blur-xl p-1 animate-fade-in">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onMouseDown={() => onSelect(opt)}
              className={`w-full text-left px-3 py-2.5 text-[13px] rounded-lg transition-colors ${
                opt === value ? "bg-[var(--accent)]/20 text-white" : "text-[#b0b0c0] hover:bg-white/5"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
