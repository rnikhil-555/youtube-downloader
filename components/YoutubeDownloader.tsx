"use client";
import React, { useState } from "react";
import axios from "axios";
import { VideoCard, VideoData } from "./FormatSelector";

interface VideoFormat {
	itag: string;
	qualityLabel: string;
	container: string;
	size: string;
	type: string;
	is60fps: boolean;
	url: string;
}

const YouTubeDownloader: React.FC = () => {
	const [url, setUrl] = useState<string>("");
	const [videoData, setVideoData] = useState<VideoData | null>(null);
	const [downloadLink, setDownloadLink] = useState<string>("");
	const [error, setError] = useState<string>("");

	const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setUrl(e.target.value);
	};

	const validateUrl = async () => {
		try {
			const response = await axios.post("/api/validate-url", { url });
			const fetchedData = response.data;

			// Transform the fetched data into the VideoData format expected by VideoCard
			const transformedData: VideoData = {
				imageSrc: fetchedData.thumbnail, // Assuming thumbnailUrl is returned
				title: fetchedData.title,
				tags: fetchedData.tags || "", // Assuming tags are returned or set empty string if not
				duration: fetchedData.duration || "Unknown", // Assuming duration is returned or set to "Unknown" if not
				audioFormats: fetchedData.formats
					.filter((format: any) => format.type === "audio")
					.map((format: any) => ({
						name: format.qualityLabel || "Audio only",
						size: format.size,
					})),
				videoFormats: fetchedData.formats
					.filter((format: any) => format.type === "video")
					.map((format: any) => ({
						quality: format.qualityLabel,
						size: format.size,
					})),
			};

			setVideoData(transformedData);
			setError("");
			setDownloadLink(""); // Clear any previous download link
		} catch (error) {
			console.error("Error validating URL:", error);
			setError("Error validating URL. Please check the URL and try again.");
			setVideoData(null);
		}
	};

	const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedItag = e.target.value;
		if (videoData) {
			const selectedFormat = videoData.videoFormats.find(
				(format) => format.quality === selectedItag
			);
			if (selectedFormat) {
				setDownloadLink(selectedFormat.size); // Assuming `size` contains the download URL; replace with the actual property that contains the URL
			} else {
				setDownloadLink("");
			}
		}
	};

	return (
		<div className="w-full h-full mx-auto p-6 bg-white">
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
			>
				Validate URL
			</button>
			{videoData && (
				<div className="mt-4">
					<VideoCard {...videoData} />
				</div>
			)}
			{downloadLink && (
				<div className="mt-4">
					<a
						href={downloadLink}
						download={`${videoData?.title}.${downloadLink.split(".").pop()}`}
						target="_blank"
						className="w-full block text-center bg-indigo-500 text-white p-2 rounded hover:bg-indigo-600 transition duration-200"
					>
						Download File
					</a>
				</div>
			)}
			{error && (
				<div className="mt-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
			)}
		</div>
	);
};

export default YouTubeDownloader;
