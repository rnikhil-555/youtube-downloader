import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";

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

// Interface for the format object used in yt-dlp
interface VideoFormat {
	format_id: string;
	format_note: string;
	ext: string;
	filesize: number | null;
	fps: number | null;
	vcodec: string;
	acodec: string;
	url: string;
}

// Interface for the video info returned by yt-dlp
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
		// Define the path to the yt-dlp binary
		const ytDlpPath = path.resolve("./bin/yt-dlp_linux"); // Adjust the binary path if needed

		// Execute yt-dlp to fetch video info
		const info: VideoInfo = await new Promise((resolve, reject) => {
			exec(
				`${ytDlpPath} --dump-single-json --no-warnings ${url}`,
				{ maxBuffer: 1024 * 1024 * 10 }, // Increase buffer size if necessary
				(error, stdout, stderr) => {
					if (error) {
						reject(`Error: ${stderr || error.message}`);
						return;
					}
					try {
						const jsonData: VideoInfo = JSON.parse(stdout);
						resolve(jsonData);
					} catch (parseError: any) {
						reject(`Error parsing video info: ${parseError.message}`);
					}
				}
			);
		});

		// Extract and filter formats
		const formats = info.formats
			.map((format) => {
				const hasVideo = format.vcodec !== "none"; // Check if format has video
				const is60fps = format.fps === 60; // Check for 60 FPS support

				return {
					itag: format.format_id, // Use `format_id` for itag
					qualityLabel: format.format_note || "Audio only", // Use `format_note` for quality label
					container: format.ext, // Container format (e.g., mp4, webm)
					size: format.filesize
						? (format.filesize / (1024 * 1024)).toFixed(2) + " MB" // Convert filesize to MB
						: "N/A",
					type: hasVideo ? "video" : "audio", // Determine if it's video or audio
					is60fps, // Include FPS support information
					url: format.url, // Include the download URL
					vcodec: format.vcodec,
					acodec: format.acodec,
				};
			})
			.filter(
				(format) =>
					format.size !== "N/A" && // Filter out formats with no size
					!["mhtml"].includes(format.container) // Filter out unwanted container formats
			);

		// Respond with the video title, thumbnail, and filtered formats
		return NextResponse.json({
			title: info.title, // Include the video title
			thumbnail: info.thumbnail, // Include the video thumbnail URL
			duration: formatDuration(info.duration),
			formats,
		});
	} catch (error) {
		console.error("Error fetching video info:", error);
		return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
	}
}
