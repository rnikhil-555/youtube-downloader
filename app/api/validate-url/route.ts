import { NextResponse } from "next/server";
import ytdl from "ytdl-core";

// Function to format duration from seconds into a readable format
function formatDuration(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = seconds % 60;

	let formattedDuration = "";
	if (hours > 0) {
		formattedDuration += `${hours}hr `;
	}
	if (minutes > 0) {
		formattedDuration += `${minutes}min `;
	}
	if (remainingSeconds > 0) {
		formattedDuration += `${remainingSeconds}s`;
	}

	return formattedDuration.trim();
}

// Interface for the format object used in ytdl-core
interface VideoFormat {
	itag: number;
	qualityLabel: string;
	container: string;
	size: string;
	type: string;
	url: string;
	vcodec: string;
	acodec: string;
}

// Interface for the video info returned by ytdl-core
interface VideoInfo {
	title: string;
	thumbnail: string;
	duration: number;
	formats: VideoFormat[];
}

// Main POST handler for the API route
export async function POST(request: Request) {
	const { url }: { url: string } = await request.json();

	try {
		// Use ytdl-core to fetch video info
		const info = await ytdl.getInfo(url);

		// Extract and filter formats
		const formats = info.formats
			.map((format) => {
				const hasVideo = format.hasVideo; // Check if format has video
				const is60fps = format.fps === 60; // Check for 60 FPS support

				return {
					itag: format.itag,
					qualityLabel: format.qualityLabel || "Audio only",
					container: format.container || "unknown",
					size: format.contentLength
						? (parseInt(format.contentLength) / (1024 * 1024)).toFixed(2) +
						  " MB" // Convert filesize to MB
						: "N/A",
					type: hasVideo ? "video" : "audio",
					is60fps,
					url: format.url,
					vcodec: format.videoCodec || "none",
					acodec: format.audioCodec || "none",
				};
			})
			.filter(
				(format) =>
					format.size !== "N/A" && // Filter out formats with no size
					!["mhtml"].includes(format.container) // Filter out unwanted container formats
			);

		// Respond with the video title, thumbnail, and filtered formats
		return NextResponse.json({
			title: info.videoDetails.title,
			thumbnail: info.videoDetails.thumbnails[0]?.url || "",
			// duration: formatDuration(info.videoDetails.lengthSeconds),
			formats,
			info,
		});
	} catch (error) {
		console.error("Error fetching video info:", error);
		return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
	}
}
