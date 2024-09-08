"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { useRef, useState } from "react";

export default function FFmpegComponent() {
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const messageRef = useRef<HTMLParagraphElement | null>(null);
  const ffmpegRef = useRef(new FFmpeg());

  const load = async () => {
    setIsLoading(true);
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }) => {
      if (messageRef.current) messageRef.current.innerHTML = message;
    });
    // Load ffmpeg
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
    setLoaded(true);
    setIsLoading(false);
  };

  const mergeAudioVideo = async () => {
    setIsProcessing(true);
    const ffmpeg = ffmpegRef.current;
    try {
      // Download video and audio
      await ffmpeg.writeFile(
        "input_video.webm",
        await fetchFile("VIDEO_URL_HERE")
      );
      await ffmpeg.writeFile(
        "input_audio.webm",
        await fetchFile("AUDIO_URL_HERE")
      );

      // Merge video and audio
      await ffmpeg.exec([
        "-i",
        "input_video.webm",
        "-i",
        "input_audio.webm",
        "-c",
        "copy",
        "output.mp4",
      ]);

      // Read the output file
      const data = await ffmpeg.readFile("output.mp4");
      if (videoRef.current && data) {
        const blob =
          data instanceof Uint8Array
            ? new Blob([data.buffer], { type: "video/mp4" })
            : new Blob([data], { type: "video/mp4" });
        videoRef.current.src = URL.createObjectURL(blob);
      }
    } catch (error) {
      console.error("Error processing video:", error);
      if (messageRef.current) {
        messageRef.current.textContent =
          "Error processing video. Please try again.";
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return loaded ? (
    <div className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
      <video ref={videoRef} controls></video>
      <br />
      <button
        onClick={mergeAudioVideo}
        className="bg-green-500 hover:bg-green-700 text-white py-3 px-6 rounded"
        disabled={isProcessing}
      >
        {isProcessing ? "Processing..." : "Merge Audio and Video"}
      </button>
      <p ref={messageRef}></p>
    </div>
  ) : (
    <button
      className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex items-center bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
      onClick={load}
    >
      Load ffmpeg-core
      {isLoading && (
        <span className="animate-spin ml-3">
          <svg
            viewBox="0 0 1024 1024"
            focusable="false"
            data-icon="loading"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path>
          </svg>
        </span>
      )}
    </button>
  );
}
