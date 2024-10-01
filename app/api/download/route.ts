import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import AWS from "aws-sdk";
import ffmpeg from "fluent-ffmpeg";
import axios from "axios";
import ffmpegPath from "ffmpeg-static";

const safeFfmpegPath = ffmpegPath ?? "./bin/ffmpeg"; // Adjust this path as needed
console.log(safeFfmpegPath);
if (!safeFfmpegPath) {
	throw new Error(
		"FFmpeg binary not found. Please ensure ffmpeg-static is correctly installed."
	);
}

ffmpeg.setFfmpegPath(safeFfmpegPath);

// Initialize the Wasabi S3 client
const s3 = new AWS.S3({
	endpoint: "https://s3.wasabisys.com",
	accessKeyId: process.env.WASABI_ACCESS_KEY_ID || "",
	secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY || "",
	region: process.env.WASABI_REGION || "",
});

// Function to sanitize the filename
function sanitizeFilename(filename: string): string {
	return filename.replace(/[^a-z0-9.-]/gi, "_").toLowerCase();
}

// Function to ensure directories exist
function ensureDirectoryExists(dir: string): void {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
}

// Function to download a file
async function downloadFile(url: string, outputPath: string): Promise<void> {
	try {
		const response = await axios({
			url,
			method: "GET",
			responseType: "stream",
		});

		const writer = fs.createWriteStream(outputPath);
		response.data.pipe(writer);

		return new Promise((resolve, reject) => {
			writer.on("finish", resolve);
			writer.on("error", reject);
		});
	} catch (error: any) {
		throw new Error(`Failed to download file from ${url}: ${error.message}`);
	}
}

// Function to merge video and audio using ffmpeg
async function mergeVideoAndAudio(
	videoPath: string,
	audioPath: string,
	outputPath: string
): Promise<void> {
	return new Promise((resolve, reject) => {
		ffmpeg()
			.setFfmpegPath(ffmpegPath) // Explicitly set the ffmpeg path again for redundancy
			.input(videoPath)
			.input(audioPath)
			.outputOptions("-c:v copy")
			.outputOptions("-c:a aac")
			.outputOptions("-strict experimental")
			.save(outputPath)
			.on("end", () => resolve())
			.on("error", (err) => reject(err));
	});
}

export async function POST(request: Request) {
	const { videoUrl, audioUrl, title } = await request.json();

	if (!videoUrl || !audioUrl || !title) {
		return NextResponse.json({ error: "Invalid input data." }, { status: 400 });
	}

	const sanitizedTitle = sanitizeFilename(title);

	const videoFileName = `${sanitizedTitle}-video.mp4`;
	const audioFileName = `${sanitizedTitle}-audio.mp3`;
	const outputFileName = `${sanitizedTitle}-merged.mp4`;

	const downloadsDir = path.join(process.cwd(), "public", "downloads");
	ensureDirectoryExists(downloadsDir); // Ensure the downloads directory exists

	const videoOutputPath = path.join(downloadsDir, videoFileName);
	const audioOutputPath = path.join(downloadsDir, audioFileName);
	const mergedOutputPath = path.join(downloadsDir, outputFileName);

	const bucketName = process.env.WASABI_BUCKET_NAME;

	if (!bucketName) {
		return NextResponse.json(
			{ error: "S3 bucket name is not configured." },
			{ status: 500 }
		);
	}

	const s3Key = `${sanitizedTitle}/${outputFileName}`;

	try {
		// Check if the file exists in Wasabi S3
		try {
			await s3.headObject({ Bucket: bucketName, Key: s3Key }).promise();
			const downloadURL = s3.getSignedUrl("getObject", {
				Bucket: bucketName,
				Key: s3Key,
				Expires: 60 * 60 * 24, // 1 day expiry
			});
			return NextResponse.json({ downloadURL }, { status: 200 });
		} catch (error: any) {
			if (error.code !== "NotFound") throw error;

			// Download video and audio
			if (!fs.existsSync(videoOutputPath)) {
				await downloadFile(videoUrl, videoOutputPath);
			}
			if (!fs.existsSync(audioOutputPath)) {
				await downloadFile(audioUrl, audioOutputPath);
			}

			// Merge video and audio using ffmpeg
			await mergeVideoAndAudio(
				videoOutputPath,
				audioOutputPath,
				mergedOutputPath
			);

			// Upload the merged file to Wasabi S3
			const fileBuffer = fs.readFileSync(mergedOutputPath);
			await s3
				.putObject({
					Bucket: bucketName,
					Key: s3Key,
					Body: fileBuffer,
					ContentType: "video/mp4",
				})
				.promise();

			const downloadURL = s3.getSignedUrl("getObject", {
				Bucket: bucketName,
				Key: s3Key,
				Expires: 60 * 60 * 24, // 1 day expiry
			});

			// Clean up local files
			if (fs.existsSync(videoOutputPath)) fs.unlinkSync(videoOutputPath);
			if (fs.existsSync(audioOutputPath)) fs.unlinkSync(audioOutputPath);
			if (fs.existsSync(mergedOutputPath)) fs.unlinkSync(mergedOutputPath);

			return NextResponse.json({ downloadURL }, { status: 200 });
		}
	} catch (error: any) {
		return NextResponse.json(
			{ error: "Download or upload failed", details: error.message },
			{ status: 500 }
		);
	}
}
