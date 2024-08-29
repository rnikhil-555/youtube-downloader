"use client";
import React, { useState } from "react";
import axios from "axios";

const YouTubeDownloader: React.FC = () => {
	const [url, setUrl] = useState("");
	const [videoInfo, setVideoInfo] = useState(null);
	const [selectedFormat, setSelectedFormat] = useState("");
	const [downloadLink, setDownloadLink] = useState("");
	const [error, setError] = useState("");

	const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setUrl(e.target.value);
	};

	const validateUrl = async () => {
		try {
			const response = await axios.post("/api/validate-url", { url });
			setVideoInfo(response.data);
			setError("");
		} catch (error) {
			console.error("Error validating URL:", error);
			setError("Error validating URL. Please check the URL and try again.");
		}
	};

	const startDownload = async () => {
		try {
			const response = await axios.post(
				"/api/start-download",
				{
					url,
					format: selectedFormat,
				},
				{ responseType: "blob" }
			);

			const blob = new Blob([response.data], {
				type: response.headers["content-type"],
			});
			const downloadUrl = window.URL.createObjectURL(blob);
			setDownloadLink(downloadUrl);
			setError("");
		} catch (error) {
			console.error("Error starting download:", error);
			setError("Error starting download. Please try again.");
		}
	};

	return (
		<div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
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
			{videoInfo && (
				<div className="mt-4">
					<h2 className="text-xl font-semibold mb-2">{videoInfo.title}</h2>
					<select
						value={selectedFormat}
						onChange={(e) => setSelectedFormat(e.target.value)}
						className="w-full p-2 border rounded text-black"
					>
						<option value="">Select Format</option>
						<option value="mp4">MP4</option>
						<option value="mp3">MP3</option>
					</select>
					<button
						onClick={startDownload}
						disabled={!selectedFormat}
						className="w-full mt-4 bg-green-500 text-white p-2 rounded hover:bg-green-600 transition duration-200 disabled:bg-gray-300"
					>
						Start Download
					</button>
				</div>
			)}
			{downloadLink && (
				<div className="mt-4">
					<a
						href={downloadLink}
						download={`${videoInfo.title}.${selectedFormat}`}
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
