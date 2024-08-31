import { NextResponse } from "next/server";
import ytdl from "youtube-dl-exec";
import fs from "fs";
import path from "path";
import AWS from "aws-sdk";

// Initialize the Wasabi S3 client
const s3 = new AWS.S3({
	endpoint: "https://s3.wasabisys.com",
	accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
	secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY,
	region: process.env.WASABI_REGION,
});

// Function to sanitize the filename
function sanitizeFilename(filename: string): string {
	return filename.replace(/[^a-z0-9.-]/gi, "_").toLowerCase();
}

export async function POST(request: Request) {
	const { url, itag, title, vId, type, container } = await request.json();
	const sanitizedTitle = sanitizeFilename(title);

	let fileExtension: string;
	let contentType: string;

	if (type === "audio") {
		fileExtension = container === "webm" ? "webm" : "mp3";
		contentType = container === "webm" ? "audio/webm" : "audio/mpeg";
	} else {
		fileExtension = "mp4"; // Assuming video is always mp4 for simplicity
		contentType = "video/mp4";
	}

	const fileName = `${sanitizedTitle}-${itag}.${fileExtension}`;
	const outputPath = path.join(process.cwd(), "public", "downloads", fileName);

	const bucketName = process.env.WASABI_BUCKET_NAME!;
	const s3Key = `${vId}/${fileName}`;

	let format =
		type === "audio"
			? "bestaudio"
			: `bestvideo[height<=${itag}]+bestaudio/best[height<=${itag}]`;

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

			// File does not exist in Wasabi S3, proceed with download
			if (!fs.existsSync(outputPath)) {
				await ytdl(url, {
					format,
					output: outputPath,
					mergeOutputFormat: type === "video" ? "mp4" : undefined,
				});
			}

			// Upload the file to Wasabi S3
			const fileBuffer = fs.readFileSync(outputPath);
			await s3
				.putObject({
					Bucket: bucketName,
					Key: s3Key,
					Body: fileBuffer,
					ContentType: contentType,
				})
				.promise();

			const downloadURL = s3.getSignedUrl("getObject", {
				Bucket: bucketName,
				Key: s3Key,
				Expires: 60 * 60 * 24, // 1 day expiry
			});

			if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

			return NextResponse.json({ downloadURL }, { status: 200 });
		}
	} catch (error: any) {
		return NextResponse.json(
			{ error: "Download or upload failed", details: error.message },
			{ status: 500 }
		);
	}
}
