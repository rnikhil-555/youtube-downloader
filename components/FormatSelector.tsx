import React, { useState, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

export interface Format {
  name?: string;
  size: string;
  quality?: string;
  url: string;
  hasAudio?: boolean;
}

export interface VideoData {
  imageSrc: string;
  title: string;
  tags: string;
  duration: string;
  audioFormats: Format[];
  videoFormats: Format[];
}

export function VideoCard({
  imageSrc,
  title,
  tags,
  duration,
  audioFormats,
  videoFormats,
}: VideoData) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [serviceWorker, setServiceWorker] = useState<ServiceWorker | null>(
    null
  );
  const [ffmpeg, setFFmpeg] = useState<FFmpeg | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js", { scope: "/" })
        .then((registration) => {
          console.log(
            "Service Worker registered successfully:",
            registration.scope
          );
          setServiceWorker(
            registration.active ||
              registration.waiting ||
              registration.installing
          );
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }

    const loadFFmpeg = async () => {
      const ffmpegInstance = new FFmpeg();
      await ffmpegInstance.load();
      setFFmpeg(ffmpegInstance);
    };

    loadFFmpeg();
  }, []);

  const getLargestAudioFormat = () => {
    return audioFormats.reduce((largest, current) => {
      const largestSize = parseInt(largest.size.replace(/\D/g, ""));
      const currentSize = parseInt(current.size.replace(/\D/g, ""));
      return currentSize > largestSize ? current : largest;
    });
  };

  const handleConvert = async (videoUrl: string) => {
    if (!ffmpeg) return;
    setIsProcessing(true);
    setProgress(0);

    const largestAudioFormat = getLargestAudioFormat();

    try {
      // Download video
      await ffmpeg.writeFile("input_video.mp4", await fetchFile(videoUrl));
      setProgress(40);

      // Download audio
      await ffmpeg.writeFile(
        "input_audio.mp3",
        await fetchFile(largestAudioFormat.url)
      );
      setProgress(70);

      // Merge files
      await ffmpeg.exec([
        "-i",
        "input_video.mp4",
        "-i",
        "input_audio.mp3",
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "output.mp4",
      ]);
      setProgress(90);

      // Read the result
      const data = await ffmpeg.readFile("output.mp4");
      const blob = new Blob([data], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);

      // Trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged_video.mp4";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setIsProcessing(false);
      setProgress(100);
    } catch (error) {
      console.error("Conversion failed:", error);
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadFile = async (
    url: string,
    onProgress: (progress: number) => void
  ): Promise<Blob> => {
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
      onProgress(loaded / total);
    }

    return new Blob(chunks);
  };

  return (
    <div className="w-full h-full">
      <div className="flex flex-col items-center p-4 border border-gray-700 rounded md:flex-row md:space-x-4">
        <img
          src={imageSrc}
          alt={title}
          className="w-72 rounded"
          style={{ aspectRatio: "16/9", objectFit: "cover" }}
        />
        <div className="flex flex-col items-start mt-4 space-y-2 md:mt-0 text-white">
          <p>{title}</p>
          <p>{tags}</p>
          <p>Duration: {duration}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-white">Audio</h2>
          {audioFormats.map((format, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 border border-gray-700 rounded text-white text-ellipsis bg-[#373838]"
            >
              <div className="text-ellipsis overflow-hidden w-1/3">
                {format.name}
              </div>
              <div className="text-ellipsis w-1/3">{format.size}</div>
              <a
                href={format.url}
                target="_blank"
                className="bg-green-500 p-1 w-1/3 text-ellipsis text-center"
              >
                DOWNLOAD
              </a>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-white">Video</h2>
          {videoFormats.map((format, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 border border-gray-700 rounded text-white bg-[#373838]"
            >
              <div className="w-1/3 text-ellipsis">{format.quality}</div>
              <div className="w-1/3 text-ellipsis">{format.size}</div>
              {format?.hasAudio ? (
                <a
                  href={format.url}
                  target="_blank"
                  className="bg-green-500 p-1 w-1/3 text-ellipsis text-center"
                >
                  DOWNLOAD
                </a>
              ) : (
                <button
                  onClick={() => handleConvert}
                  className="bg-green-500 p-1 w-1/3 text-ellipsis text-center"
                >
                  CONVERT
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
