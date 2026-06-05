// VidRush Pipeline — client-side state machine + real FFmpeg rendering
// When user uploads files → produces a real .mp4 via backend server
// When no files → uses free sample clips (demo mode)

import { processVideo } from "./ffmpeg-processor";
import { processVideoFiles } from "./video-processor";

export type Stage =
  | "researching"
  | "writing"
  | "voiceover"
  | "footage"
  | "rendering"
  | "done"
  | "error";

export interface ScriptSection {
  id: number;
  narration: string;
  visual_keyword: string;
  on_screen_text: string;
  duration: number;
}

export interface Script {
  title: string;
  hook: string;
  sections: ScriptSection[];
  outro: string;
  description: string;
}

export interface Clip {
  id: number;
  keyword: string;
  thumbUrl: string;
  status: "pending" | "downloading" | "ready";
}

export interface RenderStep {
  label: string;
  done: boolean;
}

export interface Job {
  id: string;
  topic: string;
  voice: "male" | "female";
  length: "short" | "medium" | "long";
  stage: Stage;
  progress: number;
  message: string;
  script?: Script;
  clips?: Clip[];
  renderSteps?: RenderStep[];
  renderProgress?: number;
  videoUrl?: string;
  userVideoUrl?: string;
  durationSec?: number;
  createdAt: number;
  // File references (not serialisable — kept in memory only)
  _videoFiles?: File[];
  _audioFile?: File | null;
}

type Listener = (job: Job) => void;

const jobs = new Map<string, Job>();
const listeners = new Map<string, Set<Listener>>();

function emit(id: string) {
  const job = jobs.get(id);
  if (!job) return;
  listeners.get(id)?.forEach((l) => l(job));
}

function update(id: string, patch: Partial<Job>) {
  const cur = jobs.get(id);
  if (!cur) return;
  jobs.set(id, { ...cur, ...patch });
  emit(id);
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

/** Attach a user-uploaded video (objectURL) to an existing job */
export function setUserVideo(id: string, url: string) {
  update(id, { userVideoUrl: url });
}

export function subscribe(id: string, listener: Listener): () => void {
  if (!listeners.has(id)) listeners.set(id, new Set());
  listeners.get(id)!.add(listener);
  const job = jobs.get(id);
  if (job) listener(job);
  return () => listeners.get(id)?.delete(listener);
}

function makeScript(topic: string): Script {
  const cleanTopic = topic.trim() || "the secrets of the universe";
  const title = capitalize(cleanTopic);
  const keywords = [
    "city skyline", "ocean waves", "ancient ruins", "neon lights", "forest trail",
    "mountain peak", "data servers", "crowded street", "starry sky", "desert dunes",
    "rainy window", "library books", "fire embers", "river flow", "tokyo crossing",
  ];
  const narrations = [
    "Most people have no idea this exists.",
    "But once you see it, you can't unsee it.",
    "The story begins in a place you'd never expect.",
    "Hidden in plain sight for centuries.",
    "Researchers were stunned by what they found.",
    "And the implications go far deeper than anyone thought.",
    "Every detail had been carefully designed.",
    "There's a reason this was kept quiet.",
    "Today, the truth is finally surfacing.",
    "Each piece of evidence points the same direction.",
    "The pattern is unmistakable once you know what to look for.",
    "Experts are now revisiting everything they thought they knew.",
    "And it changes how we understand the entire timeline.",
    "The final piece is the most unsettling of all.",
    "Which brings us to the conclusion no one wants to admit.",
  ];
  const sections: ScriptSection[] = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    narration: narrations[i],
    visual_keyword: keywords[i],
    on_screen_text: keywords[i].toUpperCase(),
    duration: 4,
  }));
  return {
    title,
    hook: `Here's what nobody tells you about ${cleanTopic}.`,
    sections,
    outro: "If this opened your eyes, subscribe — there's more coming.",
    description: `A deep-dive into ${cleanTopic}. Researched, scripted, and produced by VidRush AI.`,
  };
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function gradientThumb(seed: number): string {
  const hues = [262, 200, 14, 180, 320, 40, 280, 160, 220, 0, 100, 240, 60, 300, 190];
  const h1 = hues[seed % hues.length];
  const h2 = (h1 + 40) % 360;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(${h1},70%,35%)'/><stop offset='1' stop-color='hsl(${h2},80%,18%)'/></linearGradient></defs><rect width='320' height='180' fill='url(#g)'/><circle cx='${40 + (seed * 23) % 240}' cy='${40 + (seed * 17) % 100}' r='40' fill='hsl(${h2},90%,60%)' opacity='0.35'/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function createJob(input: {
  topic: string;
  voice: "male" | "female";
  length: "short" | "medium" | "long";
  videoFiles?: File[];
  audioFile?: File | null;
}): string {
  const id = Math.random().toString(36).slice(2, 10);
  const job: Job = {
    id,
    topic: input.topic,
    voice: input.voice,
    length: input.length,
    stage: "researching",
    progress: 0,
    message: "Initializing pipeline...",
    createdAt: Date.now(),
    _videoFiles: input.videoFiles ?? [],
    _audioFile: input.audioFile ?? null,
  };
  jobs.set(id, job);
  runPipeline(id).catch((e) => {
    update(id, { stage: "error", message: String(e) });
  });
  return id;
}

async function runPipeline(id: string) {
  // ── 1. RESEARCH ──────────────────────────────────────────
  update(id, { stage: "researching", progress: 10, message: "Researching topic angles..." });
  await sleep(1400);
  update(id, { progress: 50, message: "Cross-referencing sources..." });
  await sleep(1400);
  update(id, { progress: 90, message: "Outlining narrative arc..." });
  await sleep(1200);

  // ── 2. WRITE ─────────────────────────────────────────────
  const job = jobs.get(id)!;
  const script = makeScript(job.topic);
  update(id, { stage: "writing", progress: 20, message: "Drafting script structure...", script: { ...script, sections: [] } });
  for (let i = 0; i < script.sections.length; i++) {
    await sleep(120);
    const cur = jobs.get(id)!;
    const sections = [...(cur.script?.sections ?? []), script.sections[i]];
    update(id, {
      script: { ...script, sections },
      progress: Math.round(((i + 1) / script.sections.length) * 100),
      message: `Writing section ${i + 1} of ${script.sections.length}...`,
    });
  }

  // ── 3. VOICEOVER ─────────────────────────────────────────
  update(id, { stage: "voiceover", progress: 0, message: `Synthesizing ${job.voice} neural voice...` });
  for (let p = 0; p <= 100; p += 8) {
    await sleep(160);
    update(id, { progress: p, message: p < 100 ? `Generating audio... ${p}%` : "Voiceover ready" });
  }

  // ── 4. FOOTAGE ───────────────────────────────────────────
  const clips: Clip[] = script.sections.map((s) => ({
    id: s.id,
    keyword: s.visual_keyword,
    thumbUrl: gradientThumb(s.id),
    status: "pending",
  }));
  update(id, { stage: "footage", progress: 0, clips, message: "Querying Pexels library..." });
  for (let i = 0; i < clips.length; i++) {
    const cur = jobs.get(id)!;
    const next = [...cur.clips!];
    next[i] = { ...next[i], status: "downloading" };
    update(id, { clips: next, message: `Downloading: ${next[i].keyword}...` });
    await sleep(180);
    const cur2 = jobs.get(id)!;
    const next2 = [...cur2.clips!];
    next2[i] = { ...next2[i], status: "ready" };
    update(id, { clips: next2, progress: Math.round(((i + 1) / clips.length) * 100) });
  }

  // ── 5. RENDER (real FFmpeg or demo) ──────────────────────
  const renderSteps: RenderStep[] = [
    { label: "Loading FFmpeg engine", done: false },
    { label: "Writing clips to memory", done: false },
    { label: "Concatenating video timeline", done: false },
    { label: "Mixing audio track", done: false },
    { label: "Encoding H.264 + AAC", done: false },
    { label: "Packaging final MP4", done: false },
  ];

  update(id, {
    stage: "rendering",
    progress: 0,
    renderSteps,
    renderProgress: 0,
    message: "Starting render engine...",
  });

  const curJob = jobs.get(id)!;
  const videoFiles = curJob._videoFiles ?? [];
  const audioFile = curJob._audioFile ?? null;
  const hasVideoFiles = videoFiles.length > 0;

  if (hasVideoFiles || audioFile !== null) {
    // ── REAL MODE: video uploads use server-side render, audio-only falls back to browser demo engine
    let lastStepIdx = -1;

    const outputUrl = hasVideoFiles
      ? await processVideoFiles({
          clipFiles: videoFiles.map((file) => ({ file, duration: 0 })),
          audioFile: audioFile ?? undefined,
          onProgress: (pct) => {
            const stepIdx = Math.min(
              Math.floor((pct / 100) * renderSteps.length),
              renderSteps.length - 1
            );
            const cur3 = jobs.get(id)!;
            const nextSteps = cur3.renderSteps!.map((s, idx) => ({
              ...s,
              done: idx <= stepIdx,
            }));
            if (stepIdx !== lastStepIdx) lastStepIdx = stepIdx;
            update(id, {
              renderSteps: nextSteps,
              renderProgress: pct,
              progress: pct,
              message: `Rendering on server: ${pct}%`,
            });
          },
        })
      : await processVideo({
          videoFiles,
          audioFile,
          onProgress: (pct, msg) => {
            const stepIdx = Math.min(
              Math.floor((pct / 100) * renderSteps.length),
              renderSteps.length - 1
            );
            const cur3 = jobs.get(id)!;
            const nextSteps = cur3.renderSteps!.map((s, idx) => ({
              ...s,
              done: idx <= stepIdx,
            }));
            if (stepIdx !== lastStepIdx) lastStepIdx = stepIdx;
            update(id, {
              renderSteps: nextSteps,
              renderProgress: pct,
              progress: pct,
              message: msg,
            });
          },
        });

    const cur3 = jobs.get(id)!;
    update(id, {
      renderSteps: cur3.renderSteps!.map((s) => ({ ...s, done: true })),
      renderProgress: 100,
      progress: 100,
    });

    await sleep(400);
    update(id, {
      stage: "done",
      progress: 100,
      message: "Render complete",
      videoUrl: outputUrl,
      durationSec: 60,
    });
  } else {
    // ── DEMO MODE: animated steps + sample video ─────────
    for (let i = 0; i < renderSteps.length; i++) {
      await sleep(700);
      const cur3 = jobs.get(id)!;
      const nextSteps = cur3.renderSteps!.map((s, idx) =>
        idx === i ? { ...s, done: true } : s
      );
      update(id, {
        renderSteps: nextSteps,
        renderProgress: Math.round(((i + 1) / renderSteps.length) * 100),
        progress: Math.round(((i + 1) / renderSteps.length) * 100),
        message: renderSteps[i].label,
      });
    }

    await sleep(600);
    update(id, {
      stage: "done",
      progress: 100,
      message: "Render complete",
      videoUrl:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      durationSec: 60,
    });
  }
}
