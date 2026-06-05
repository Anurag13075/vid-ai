/**
 * VidRush FFmpeg Processor
 * Runs entirely in the browser using @ffmpeg/ffmpeg (WASM).
 * Uses single-threaded core — no SharedArrayBuffer / COEP headers needed.
 */

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export const DEMO_VIDEO_URLS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
];

export const DEMO_AUDIO_URL =
  "https://www.soundjay.com/misc/sounds/fail-trombone-01.mp3";

let _ffmpeg: FFmpeg | null = null;
let _loaded = false;

export type ProgressCallback = (pct: number, message: string) => void;

async function getFFmpeg(): Promise<FFmpeg> {
  if (_ffmpeg && _loaded) return _ffmpeg;

  const ffmpeg = new FFmpeg();
  _ffmpeg = ffmpeg;

  // Crucial for debugging: Prints actual FFmpeg terminal logs straight into browser DevTools console
  ffmpeg.on("log", ({ message }) => {
    console.log("🎬 [FFmpeg WASM Core]:", message);
  });

  const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm";

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  _loaded = true;
  return ffmpeg;
}

export interface ProcessVideoOptions {
  videoFiles: File[];
  audioFile: File | null;
  onProgress: ProgressCallback;
}

export async function processVideo(opts: ProcessVideoOptions): Promise<string> {
  const { videoFiles, audioFile, onProgress } = opts;

  onProgress(2, "Loading FFmpeg engine…");
  const ffmpeg = await getFFmpeg();

  // Progress guard layer to handle UI stepper positions cleanly
  ffmpeg.on("progress", ({ progress }) => {
    if (typeof progress !== "number" || isNaN(progress) || !isFinite(progress)) {
      return;
    }
    const safeProgress = Math.max(0, Math.min(1, progress));
    
    // Map progress into a stable 55% - 90% range
    const pct = 55 + Math.round(safeProgress * 35);
    onProgress(Math.max(55, Math.min(pct, 90)), "Encoding timeline assets…");
  });

  onProgress(15, "Writing video clips to memory…");

  const useDemo = videoFiles.length === 0;
  const clipSources = useDemo ? DEMO_VIDEO_URLS : videoFiles;
  const clipCount = clipSources.length;

  for (let i = 0; i < clipCount; i++) {
    const src = clipSources[i];
    const filename = `clip${i}.mp4`;
    const data = await fetchFile(src as string | File);
    await ffmpeg.writeFile(filename, data);
    onProgress(15 + Math.round(((i + 1) / clipCount) * 25), `Loaded clip ${i + 1} of ${clipCount}`);
  }

  onProgress(45, "Stitching video timeline…");
  const concatFile = "concat_out.mp4";

  if (clipCount === 1) {
    // If it's a single clip, avoid processing overhead and pass it forward instantly
    await ffmpeg.exec(["-i", "clip0.mp4", "-c", "copy", concatFile]);
  } else {
    // Build text list file mapping references
    const listContent = clipSources.map((_, i) => `file 'clip${i}.mp4'`).join("\n");
    const enc = new TextEncoder();
    await ffmpeg.writeFile("list.txt", enc.encode(listContent));

    // PERFORMANCE FIX: Use stream copy ("-c copy") instead of re-encoding with libx264 here.
    // This completes the video stitching instantly in milliseconds!
    await ffmpeg.exec([
      "-f", "concat",
      "-safe", "0",
      "-i", "list.txt",
      "-c", "copy",
      concatFile
    ]);
  }

  onProgress(60, "Processing audio rendering block…");
  const outputFile = "vidrush_output.mp4";

  if (audioFile) {
    const audioData = await fetchFile(audioFile);
    await ffmpeg.writeFile("voice.mp3", audioData);

    // Run a single optimization encoding pass while merging the new audio file
    await ffmpeg.exec([
      "-i", concatFile,
      "-i", "voice.mp3",
      "-c:v", "libx264",
      "-preset", "ultrafast",
      "-crf", "30", // Slightly higher CRF reduces file size and cuts render times in half
      "-c:a", "aac",
      "-map", "0:v:0",
      "-map", "1:a:0",
      "-shortest",
      "-movflags", "+faststart",
      outputFile,
    ]);
  } else {
    // No explicit audio overwrite override
    await ffmpeg.exec([
      "-i", concatFile,
      "-c:v", "libx264",
      "-preset", "ultrafast",
      "-crf", "30",
      "-c:a", "aac",
      "-movflags", "+faststart",
      outputFile,
    ]);
  }

  onProgress(95, "Packaging final MP4 container…");

  const fileData = await ffmpeg.readFile(outputFile);
  const blob = new Blob([fileData], { type: "video/mp4" });
  const url = URL.createObjectURL(blob);

  // Clean listener lifecycle
  ffmpeg.off("progress");

  onProgress(100, "Done!");
  return url;
}