import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowUp, ChevronDown, Clock, Mic } from "lucide-react";
import { createJob } from "@/lib/pipeline";

const LENGTHS = [
  { value: "short", label: "6–8 min" },
  { value: "medium", label: "10–12 min" },
  { value: "long", label: "15+ min" },
] as const;

const VOICES = [
  { value: "female", label: "Female Neural" },
  { value: "male", label: "Male Neural" },
] as const;

const SUGGESTIONS = [
  "5 dark secrets of the Roman Empire",
  "Why the deep ocean still terrifies scientists",
  "How Tokyo became the world's quietest megacity",
  "The lost technology of the ancient Egyptians",
];

export function TopicInput() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [length, setLength] = useState<(typeof LENGTHS)[number]["value"]>("medium");
  const [voice, setVoice] = useState<(typeof VOICES)[number]["value"]>("female");
  const [submitting, setSubmitting] = useState(false);

  function submit(t: string) {
    const final = t.trim();
    if (!final || submitting) return;
    setSubmitting(true);
    const id = createJob({ topic: final, voice, length });
    navigate({ to: "/generate/$jobId", params: { jobId: id } });
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-4 ring-accent-focus transition-shadow shadow-[0_30px_80px_-30px_rgba(108,71,255,0.35)]">
        <div className="flex gap-2 mb-3">
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
            value={VOICES.find((v) => v.value === voice)!.label}
            options={VOICES.map((v) => v.label)}
            onSelect={(label) => {
              const v = VOICES.find((x) => x.label === label)!.value;
              setVoice(v);
            }}
          />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(topic);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Create a video about..."
            className="flex-1 bg-transparent border-0 outline-none text-[17px] placeholder:text-[var(--text-muted)] py-2"
            autoFocus
          />
          <button
            type="submit"
            disabled={!topic.trim() || submitting}
            className="h-10 w-10 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-[0_0_24px_var(--accent-glow)]"
            aria-label="Generate video"
          >
            <ArrowUp className="h-4 w-4 text-white" />
          </button>
        </form>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => submit(s)}
            className="text-[13px] text-[var(--text-secondary)] hover:text-white px-3 py-1.5 rounded-full border border-[var(--border)] hover:border-[var(--border-active)] bg-[var(--bg-card)]/50 transition-colors"
          >
            {s}
          </button>
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
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-hover)] border border-[var(--border)] text-[13px] text-[var(--text-secondary)] hover:text-white hover:border-[var(--border-active)] transition-colors"
      >
        <span className="text-[var(--accent)]">{icon}</span>
        {value}
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 min-w-[160px] rounded-lg bg-[var(--bg-card)] border border-[var(--border-active)] shadow-xl z-20 overflow-hidden animate-fade-in">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onMouseDown={() => onSelect(opt)}
              className={`w-full text-left px-3 py-2 text-[13px] hover:bg-[var(--bg-hover)] transition-colors ${
                opt === value ? "text-white" : "text-[var(--text-secondary)]"
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
