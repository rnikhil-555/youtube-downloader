"use client";
import React, { useState } from "react";
import axios from "axios";
import { VideoCard, VideoData } from "./FormatSelector"; // Ensure FormatSelector exports VideoCard correctly

const YouTubeDownloader: React.FC = () => {
	const [url, setUrl] = useState<string>("");
	const [videoData, setVideoData] = useState<VideoData | null>(null);
	const [error, setError] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setUrl(e.target.value);
	};

	const validateUrl = async () => {
		if (!url.match(/^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/)) {
			setError("Please enter a valid YouTube URL.");
			return;
		}

		setIsLoading(true);
		setError("");
		try {
			const response = await axios.post("/api/validate-url", { url });
			const fetchedData = response.data;

			const transformedData: VideoData = {
				imageSrc: fetchedData.thumbnail,
				title: fetchedData.title,
				tags: fetchedData.tags || "",
				duration: fetchedData.duration || "Unknown",
				audioFormats: fetchedData.formats
					.filter((format: any) => format.hasAudio && !format.hasVideo)
					.map((format: any) => ({
						name: format.qualityLabel || "Audio only",
						size: format.size,
						url: format.url,
					})),
				videoFormats: fetchedData.formats
					.filter((format: any) => format.hasVideo)
					.map((format: any) => ({
						quality: format.qualityLabel,
						size: format.size,
						url: format.url,
						hasAudio: format.hasAudio,
					})),
			};

			setVideoData(transformedData);
		} catch (error) {
			console.error("Error validating URL:", error);
			setError("Error validating URL. Please check the URL and try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="w-full h-full mx-auto p-0 md:p-6 bg-[#0c0c0c]">
			<h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
				YouTube Downloader
			</h1>
			<div className="mb-4">
				<input
					type="text"
					value={url}
					onChange={handleUrlChange}
					placeholder="Enter YouTube URL"
					className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
				/>
			</div>
			<button
				onClick={validateUrl}
				className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200"
				disabled={isLoading}
			>
				{isLoading ? "Validating..." : "Validate URL"}
			</button>
			{videoData && (
				<div className="mt-4">
					<VideoCard {...videoData} />
				</div>
			)}
			{error && (
				<div className="mt-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
			)}
		</div>
	);
};

export default YouTubeDownloader;
