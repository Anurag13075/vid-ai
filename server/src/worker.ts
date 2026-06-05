import { videoQueue } from "./queue";
import { processVideo, cleanupFiles } from "./ffmpeg";

async function runNext() {
  if (videoQueue.isProcessing()) return;

  const job = videoQueue.next();
  if (!job) return;

  videoQueue.setProcessing(true);
  videoQueue.update(job.id, { state: "active", progress: 10 });
  console.log(`[worker] Starting job ${job.id}`);

  try {
    await processVideo({
      clips: job.data.clips.map((c) => ({ filePath: c.url, duration: c.duration })),
      audioPath: job.data.audioUrl,
      bgmPath: job.data.bgmUrl,
      outputFileName: job.data.outputFileName,
      onProgress: (percent) => {
        videoQueue.update(job.id, { progress: percent });
      },
    });

    cleanupFiles(job.data.clips.map((c) => c.url));

    videoQueue.update(job.id, {
      state: "completed",
      progress: 100,
      result: { outputFileName: job.data.outputFileName },
    });

    console.log(`[worker] Job ${job.id} completed`);
  } catch (err) {
    videoQueue.update(job.id, {
      state: "failed",
      error: err instanceof Error ? err.message : "Unknown error",
    });
    console.error(`[worker] Job ${job.id} failed:`, err);
  } finally {
    videoQueue.setProcessing(false);
    setImmediate(runNext);
  }
}

setInterval(runNext, 2000);
videoQueue.on("added", () => runNext());

console.log("VidRush worker started (in-memory queue, no Redis)");
