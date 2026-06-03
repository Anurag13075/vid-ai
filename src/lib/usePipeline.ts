import { useEffect, useState } from "react";
import { subscribe, type Job } from "./pipeline";

export function useJob(jobId: string | undefined): Job | undefined {
  const [job, setJob] = useState<Job | undefined>(undefined);
  useEffect(() => {
    if (!jobId) return;
    return subscribe(jobId, setJob);
  }, [jobId]);
  return job;
}
