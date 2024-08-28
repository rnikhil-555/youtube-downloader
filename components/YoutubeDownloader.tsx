"use client";

import React, { useState, useEffect } from "react";

const YouTubeDownloader: React.FC = () => {
	const [url, setUrl] = useState("");
	const [videoInfo, setVideoInfo] = useState<any>(null);
	const [selectedQuality, setSelectedQuality] = useState("");
	const [downloadProgress, setDownloadProgress] = useState(0);
	const [downloadStatus, setDownloadStatus] = useState("");
	const [error, setError] = useState("");

	const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setUrl(e.target.value);
	};

	const validateUrl = async () => {
		setError("");
		try {
			const response = await fetch("/api/validate-url", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ url }),
			});
			if (!response.ok) {
				throw new Error("Failed to validate URL");
			}
			const data = await response.json();
			setVideoInfo(data);
		} catch (error) {
			console.error("Error validating URL:", error);
			setError("Error validating URL. Please check the URL and try again.");
		}
	};

	const handleQualityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedQuality(e.target.value);
	};

	const startDownload = async () => {
		setError("");
		setDownloadStatus("starting");
		try {
			const response = await fetch("/api/start-download", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ url, quality: selectedQuality }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to start download");
			}

			// Get the filename from the Content-Disposition header
			const contentDisposition = response.headers.get("Content-Disposition");
			const filenameMatch =
				contentDisposition && contentDisposition.match(/filename="?(.+)"?/i);
			const filename = filenameMatch ? filenameMatch[1] : "video.mp4";

			// Create a blob from the response
			const blob = await response.blob();

			// Create a temporary URL for the blob
			const downloadUrl = window.URL.createObjectURL(blob);

			// Create a temporary anchor element and trigger the download
			const a = document.createElement("a");
			a.style.display = "none";
			a.href = downloadUrl;
			a.download = filename;
			document.body.appendChild(a);
			a.click();

			// Clean up
			window.URL.revokeObjectURL(downloadUrl);
			document.body.removeChild(a);

			setDownloadStatus("completed");
		} catch (error) {
			console.error("Error starting download:", error);
			setError(error.message || "Error starting download. Please try again.");
			setDownloadStatus("failed");
		}
	};

	const checkDownloadStatus = async (downloadId: string) => {
		try {
			const response = await fetch(`/api/download-status/${downloadId}`);
			if (!response.ok) {
				throw new Error("Failed to check download status");
			}
			const data = await response.json();
			setDownloadProgress(data.progress);
			setDownloadStatus(data.status);

			if (data.status !== "completed" && data.status !== "error") {
				setTimeout(() => checkDownloadStatus(downloadId), 1000);
			}
		} catch (error) {
			console.error("Error checking download status:", error);
			setError("Error checking download status. The download may have failed.");
		}
	};

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-4">YouTube Downloader</h1>
			<input
				type="text"
				value={url}
				onChange={handleUrlChange}
				placeholder="Enter YouTube URL"
				className="w-full p-2 border rounded mb-2"
			/>
			<button
				onClick={validateUrl}
				className="bg-blue-500 text-white p-2 rounded"
			>
				Validate URL
			</button>

			{videoInfo && (
				<div className="mt-4">
					<h2 className="text-xl font-semibold">{videoInfo.title}</h2>
					<select
						value={selectedQuality}
						onChange={handleQualityChange}
						className="w-full p-2 border rounded mt-2"
					>
						<option value="">Select Quality</option>
						{videoInfo.formats.map((format: any, index: number) => (
							<option key={index} value={format.itag}>
								{format.qualityLabel} - {format.container}
							</option>
						))}
					</select>
					<button
						onClick={startDownload}
						disabled={!selectedQuality}
						className="bg-green-500 text-white p-2 rounded mt-2"
					>
						Start Download
					</button>
				</div>
			)}

			{downloadStatus && (
				<div className="mt-4">
					<p>Status: {downloadStatus}</p>
					<progress value={downloadProgress} max="100" className="w-full" />
				</div>
			)}

			{error && <div className="mt-4 text-red-500">{error}</div>}
		</div>
	);
};

export default YouTubeDownloader;
