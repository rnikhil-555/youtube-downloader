"use client";
import React, { useState } from "react";
import FormatSelector from "./FormatSelector";
import ProgressBar from "./ProgressBar";

const DownloadForm = () => {
	const [url, setUrl] = useState("");
	const [videoInfo, setVideoInfo] = useState(null);
	const [selectedFormat, setSelectedFormat] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [downloadProgress, setDownloadProgress] = useState(0);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");
		setVideoInfo(null);

		try {
			const response = await fetch("/api/video-info", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ url }),
			});

			if (!response.ok) throw new Error("Failed to fetch video info");

			const data = await response.json();
			setVideoInfo(data);
		} catch (error) {
			setError(
				"Failed to fetch video information. Please check the URL and try again."
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDownload = async () => {
		if (!selectedFormat) return;

		try {
			const response = await fetch("/api/start-download", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					url,
					itag: selectedFormat.itag,
					fileName: `${videoInfo.title}.${selectedFormat.container}`,
				}),
			});

			if (!response.ok) throw new Error("Download failed");

			const reader = response.body.getReader();
			const contentLength = +response.headers.get("Content-Length");
			let receivedLength = 0;

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				receivedLength += value.length;
				setDownloadProgress(Math.round((receivedLength / contentLength) * 100));
			}

			// Trigger download
			const blob = await response.blob();
			const downloadUrl = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.style.display = "none";
			a.href = downloadUrl;
			a.download = `${videoInfo.title}.${selectedFormat.container}`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(downloadUrl);
		} catch (error) {
			setError("Download failed. Please try again.");
		}
	};

	return (
		<div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
			<h1 className="text-2xl font-bold mb-6 text-center">
				YouTube Downloader
			</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<input
						type="text"
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						placeholder="Enter YouTube URL"
						className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						required
					/>
				</div>
				<button
					type="submit"
					className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300"
					disabled={isLoading}
				>
					{isLoading ? "Loading..." : "Get Video Info"}
				</button>
			</form>

			{error && <p className="text-red-500 mt-4">{error}</p>}

			{videoInfo && (
				<div className="mt-6">
					<h2 className="text-xl font-semibold mb-2">{videoInfo.title}</h2>
					<FormatSelector
						formats={videoInfo.formats}
						onSelect={setSelectedFormat}
					/>
					<button
						onClick={handleDownload}
						disabled={!selectedFormat}
						className="w-full mt-4 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition duration-300"
					>
						Download
					</button>
				</div>
			)}

			{downloadProgress > 0 && <ProgressBar progress={downloadProgress} />}
		</div>
	);
};

export default DownloadForm;
