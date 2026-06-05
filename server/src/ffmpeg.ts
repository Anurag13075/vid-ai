import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import path from "path";
import fs from "fs";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const OUTPUTS_DIR = path.join(__dirname, "../outputs");
const UPLOADS_DIR = path.join(__dirname, "../uploads");

[OUTPUTS_DIR, UPLOADS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

export type ProcessOptions = {
  clips: Array<{ filePath: string; duration?: number }>;
  audioPath?: string;
  bgmPath?: string;
  outputFileName: string;
  onProgress?: (percent: number) => void;
};

export async function processVideo(opts: ProcessOptions): Promise<string> {
  const outputPath = path.join(OUTPUTS_DIR, opts.outputFileName);

  return new Promise((resolve, reject) => {
    const concatListPath = path.join(UPLOADS_DIR, `${opts.outputFileName}-list.txt`);
    const concatContent = opts.clips.map((c) => `file '${c.filePath}'`).join("\n");
    fs.writeFileSync(concatListPath, concatContent);

    let cmd = ffmpeg();
    cmd = cmd.input(concatListPath).inputOptions(["-f concat", "-safe 0"]);

    if (opts.audioPath) {
      cmd = cmd.input(opts.audioPath);
    }

    if (opts.bgmPath) {
      cmd = cmd.input(opts.bgmPath);
    }

    let audioFilter = "";
    if (opts.audioPath && opts.bgmPath) {
      audioFilter = "[1:a]volume=1.0[voice];[2:a]volume=0.2[bgm];[voice][bgm]amix=inputs=2:duration=first[aout]";
    } else if (opts.audioPath) {
      audioFilter = "[1:a]volume=1.0[aout]";
    }

    cmd = cmd
      .outputOptions([
        "-c:v libx264",
        "-preset fast",
        "-crf 23",
        "-c:a aac",
        "-b:a 192k",
        "-movflags +faststart",
        "-pix_fmt yuv420p",
        ...(audioFilter ? [`-filter_complex ${audioFilter}`, "-map 0:v", "-map [aout]"] : ["-map 0:v", "-an"]),
      ])
      .output(outputPath);

    if (opts.onProgress) {
      cmd = cmd.on("progress", (p) => {
        opts.onProgress!(Math.round(p.percent ?? 0));
      });
    }

    cmd
      .on("end", () => {
        try {
          if (fs.existsSync(concatListPath)) fs.unlinkSync(concatListPath);
        } catch {
          // ignore cleanup errors
        }
        resolve(outputPath);
      })
      .on("error", (err) => {
        reject(new Error(`FFmpeg error: ${err.message}`));
      })
      .run();
  });
}

export function cleanupFiles(filePaths: string[]) {
  filePaths.forEach((fp) => {
    try {
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    } catch {
      // ignore cleanup errors
    }
  });
}

