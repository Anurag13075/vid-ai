import { Router } from "express";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { videoQueue } from "../queue";
import type { VideoJobData } from "../queue";

const router = Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../../uploads"),
  filename: (_req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
});

router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  res.json({
    filePath: req.file.path,
    fileName: req.file.filename,
    size: req.file.size,
  });
});

router.post("/create", (req, res) => {
  try {
    const { clips, audioUrl, bgmUrl } = req.body as Omit<VideoJobData, "jobId" | "outputFileName">;

    if (!clips || !Array.isArray(clips) || clips.length === 0) {
      res.status(400).json({ error: "clips array is required" });
      return;
    }

    const jobId = uuidv4();
    const outputFileName = `${jobId}.mp4`;

    const job = videoQueue.add(jobId, {
      jobId,
      clips,
      audioUrl,
      bgmUrl,
      outputFileName,
    });

    res.json({
      jobId: job.id,
      outputFileName,
      status: "queued",
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to queue job" });
  }
});

router.get("/:jobId/status", (req, res) => {
  const job = videoQueue.get(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json({
    jobId: job.id,
    state: job.state,
    progress: job.progress,
    outputUrl: job.state === "completed"
      ? `http://localhost:3001/outputs/${job.result!.outputFileName}`
      : null,
    error: job.error ?? null,
  });
});

router.get("/queue/stats", (_req, res) => {
  res.json(videoQueue.stats());
});

export { router as jobsRouter };
