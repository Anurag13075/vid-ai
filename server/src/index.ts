import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { jobsRouter } from "./routes/jobs";
import "./worker";

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5174",
    credentials: true,
  })
);

app.use(express.json());

// Serve processed videos as static files
app.use("/outputs", express.static(path.join(__dirname, "../outputs")));

// All job routes
app.use("/api/jobs", jobsRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`VidRush server running on http://localhost:${PORT}`);
});
