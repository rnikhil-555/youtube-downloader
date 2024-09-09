import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const ffmpeg = new Ffmpeg();

async function downloadFile(url) {
  const response = await fetch(url);
  const contentLength = response.headers.get("content-length");
  const total = parseInt(contentLength, 10);
  let loaded = 0;

  const reader = response.body.getReader();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    self.postMessage({
      type: "progress",
      phase: "download",
      progress: loaded / total,
    });
  }

  return new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []));
}

self.onmessage = async (e) => {
  if (e.data.type === "merge") {
    const { videoUrl, audioUrl } = e.data;

    try {
      // Load FFmpeg
      await ffmpeg.load();
      self.postMessage({ type: "progress", phase: "ffmpeg", progress: 0.1 });

      // Download video and audio files
      const videoData = await downloadFile(videoUrl);
      const audioData = await downloadFile(audioUrl);

      // Write files to FFmpeg virtual file system
      await ffmpeg.writeFile("input_video.mp4", videoData);
      await ffmpeg.writeFile("input_audio.mp3", audioData);

      self.postMessage({ type: "progress", phase: "ffmpeg", progress: 0.4 });

      // Merge video and audio
      await ffmpeg.exec([
        "-i",
        "input_video.mp4",
        "-i",
        "input_audio.mp3",
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-strict",
        "experimental",
        "output.mp4",
      ]);

      self.postMessage({ type: "progress", phase: "ffmpeg", progress: 0.9 });

      // Read the output file
      const data = await ffmpeg.readFile("output.mp4");

      // Send the merged video back to the main thread
      self.postMessage({ type: "done", buffer: data.buffer }, [data.buffer]);
    } catch (error) {
      self.postMessage({ type: "error", message: error.message });
    }
  }
};
