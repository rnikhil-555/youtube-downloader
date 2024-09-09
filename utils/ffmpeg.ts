import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const ffmpeg = new FFmpeg();

export async function mergeAudioVideo(
  audioBlob: Blob,
  videoBlob: Blob
): Promise<void> {
  if (!ffmpeg.loaded) {
    await ffmpeg.load();
  }

  await ffmpeg.writeFile("audio.mp3", await fetchFile(audioBlob));
  await ffmpeg.writeFile("video.mp4", await fetchFile(videoBlob));

  await ffmpeg.exec([
    "-i",
    "video.mp4",
    "-i",
    "audio.mp3",
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "output.mp4",
  ]);

  const data = await ffmpeg.readFile("output.mp4");
  const url = URL.createObjectURL(new Blob([data], { type: "video/mp4" }));

  const a = document.createElement("a");
  a.href = url;
  a.download = "merged_video.mp4";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}
