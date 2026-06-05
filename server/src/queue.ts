import { EventEmitter } from "events";

export type VideoJobData = {
  jobId: string;
  clips: Array<{ url: string; duration: number }>;
  audioUrl?: string;
  bgmUrl?: string;
  outputFileName: string;
};

export type JobState = "waiting" | "active" | "completed" | "failed";

export type Job = {
  id: string;
  data: VideoJobData;
  state: JobState;
  progress: number;
  result?: { outputFileName: string };
  error?: string;
};

class InMemoryQueue extends EventEmitter {
  private jobs = new Map<string, Job>();
  private queue: string[] = [];
  private processing = false;

  add(id: string, data: VideoJobData): Job {
    const job: Job = { id, data, state: "waiting", progress: 0 };
    this.jobs.set(id, job);
    this.queue.push(id);
    this.emit("added", job);
    return job;
  }

  get(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  update(id: string, patch: Partial<Job>) {
    const job = this.jobs.get(id);
    if (job) {
      Object.assign(job, patch);
      this.jobs.set(id, job);
    }
  }

  next(): Job | undefined {
    const id = this.queue.shift();
    return id ? this.jobs.get(id) : undefined;
  }

  isProcessing() {
    return this.processing;
  }

  setProcessing(v: boolean) {
    this.processing = v;
  }

  stats() {
    const all = [...this.jobs.values()];
    return {
      waiting: all.filter((j) => j.state === "waiting").length,
      active: all.filter((j) => j.state === "active").length,
      completed: all.filter((j) => j.state === "completed").length,
      failed: all.filter((j) => j.state === "failed").length,
    };
  }
}

export const videoQueue = new InMemoryQueue();
