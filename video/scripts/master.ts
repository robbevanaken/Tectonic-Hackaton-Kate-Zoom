/** Loudness-normalise rendered videos to -14 LUFS (YouTube/social target); the video stream is copied untouched. */
import { execFileSync } from "node:child_process";
import { renameSync } from "node:fs";

for (const file of process.argv.slice(2)) {
  const tmp = file.replace(/\.mp4$/, ".tmp.mp4");
  execFileSync("npx", ["remotion", "ffmpeg", "-y", "-loglevel", "error", "-i", file, "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", tmp], { stdio: "inherit" });
  renameSync(tmp, file);
  console.log(`✓ mastered ${file}`);
}
