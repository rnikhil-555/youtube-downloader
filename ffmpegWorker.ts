export default function createFFmpegWorker() {
  return new Worker(new URL("./ffmpeg.worker.js", import.meta.url), {
    type: "module",
  });
}
