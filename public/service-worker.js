importScripts("https://unpkg.com/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js");

const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

self.addEventListener("message", async (event) => {
  if (event.data.type === "MERGE") {
    try {
      if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
      }

      const { videoUrl, audioUrl } = event.data;

      self.postMessage({ type: "PROGRESS", progress: 10 });

      const videoResponse = await fetch(videoUrl);
      const videoArrayBuffer = await videoResponse.arrayBuffer();
      ffmpeg.FS(
        "writeFile",
        "input_video.mp4",
        new Uint8Array(videoArrayBuffer)
      );

      self.postMessage({ type: "PROGRESS", progress: 40 });

      const audioResponse = await fetch(audioUrl);
      const audioArrayBuffer = await audioResponse.arrayBuffer();
      ffmpeg.FS(
        "writeFile",
        "input_audio.mp3",
        new Uint8Array(audioArrayBuffer)
      );

      self.postMessage({ type: "PROGRESS", progress: 70 });

      await ffmpeg.run(
        "-i",
        "input_video.mp4",
        "-i",
        "input_audio.mp3",
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "output.mp4"
      );

      const data = ffmpeg.FS("readFile", "output.mp4");
      const blob = new Blob([data.buffer], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);

      self.postMessage({ type: "COMPLETE", url });
    } catch (error) {
      self.postMessage({ type: "ERROR", error: error.message });
    }
  }
});
