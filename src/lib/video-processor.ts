const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

export type UploadedFile = {
  filePath: string;
  fileName: string;
  size: number;
};

export type JobStatus = {
  jobId: string;
  state: "waiting" | "active" | "completed" | "failed";
  progress: number;
  outputUrl: string | null;
  error: string | null;
};

export async function uploadFile(file: File): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${SERVER_URL}/api/jobs/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function createVideoJob(params: {
  clips: Array<{ url: string; duration: number }>;
  audioUrl?: string;
  bgmUrl?: string;
}): Promise<{ jobId: string; outputFileName: string; status: string }> {
  const res = await fetch(`${SERVER_URL}/api/jobs/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) throw new Error("Failed to create job");
  return res.json();
}

export async function waitForJob(
  jobId: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/jobs/${jobId}/status`);
        if (!res.ok) {
          throw new Error("Failed to fetch job status");
        }

        const status: JobStatus = await res.json();
        const progress = typeof status.progress === "number" ? status.progress : 0;
        const reportedProgress = status.state === "active" && progress === 0 ? 15 : progress;
        onProgress?.(reportedProgress);

        if (status.state === "completed" && status.outputUrl) {
          clearInterval(interval);
          resolve(status.outputUrl);
        } else if (status.state === "failed") {
          clearInterval(interval);
          reject(new Error(status.error ?? "Job failed"));
        }
      } catch (err) {
        clearInterval(interval);
        reject(err);
      }
    }, 1500);
  });
}

export async function processVideoFiles(params: {
  clipFiles: Array<{ file: File; duration: number }>;
  audioFile?: File;
  bgmFile?: File;
  onProgress?: (percent: number) => void;
}): Promise<string> {
  params.onProgress?.(0);

  const uploadedClips = await Promise.all(
    params.clipFiles.map(async ({ file, duration }) => {
      const uploaded = await uploadFile(file);
      return { url: uploaded.filePath, duration };
    })
  );

  const audioUrl = params.audioFile ? (await uploadFile(params.audioFile)).filePath : undefined;
  const bgmUrl = params.bgmFile ? (await uploadFile(params.bgmFile)).filePath : undefined;

  params.onProgress?.(10);

  const { jobId } = await createVideoJob({
    clips: uploadedClips,
    audioUrl,
    bgmUrl,
  });

  params.onProgress?.(20);

  const outputUrl = await waitForJob(jobId, (percent) => {
    params.onProgress?.(10 + Math.round(percent * 0.9));
  });

  return outputUrl;
}
