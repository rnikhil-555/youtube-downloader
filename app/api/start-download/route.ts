import { NextResponse } from "next/server";
import ytdl from "youtube-dl-exec";
import fs from "fs";
import path from "path";
import AWS from "aws-sdk";

// Initialize the Wasabi S3 client
const s3 = new AWS.S3({
	endpoint: "https://s3.wasabisys.com", // Wasabi's endpoint
	accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
	secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY,
	region: process.env.WASABI_REGION,
});

// Function to sanitize the filename
function sanitizeFilename(filename: string): string {
	return filename.replace(/[^a-z0-9.-]/gi, "_").toLowerCase();
}

export async function POST(request: Request) {
	const { url, type, quality, title, vId } = await request.json();

	const sanitizedTitle = sanitizeFilename(title); // Sanitize the title

	const fileExtension = type === "audio" ? "mp3" : "mp4";
	const fileName = `${sanitizedTitle}-${quality}.${fileExtension}`;
	const outputPath = path.join(process.cwd(), "public", "downloads", fileName);

	const bucketName = process.env.WASABI_BUCKET_NAME!;
	const s3Key = `${vId}/${fileName}`;

	let format = "";

	if (type === "audio") {
		format = "bestaudio";
	} else if (type === "video") {
		format = `bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]`;
	}

	try {
		// Check if the file exists in Wasabi S3
		try {
			await s3.headObject({ Bucket: bucketName, Key: s3Key }).promise();
			const downloadURL = s3.getSignedUrl("getObject", {
				Bucket: bucketName,
				Key: s3Key,
				Expires: 60 * 60 * 24, // 1 day expiry
			});

			// Delete the file from the server
			if (fs.existsSync(outputPath)) {
				fs.unlinkSync(outputPath);
				console.log("Local file deleted:", outputPath);
			}

			return NextResponse.json({ downloadURL }, { status: 200 });
		} catch (error: any) {
			if (error.code !== "NotFound") {
				throw error;
			}

			// File does not exist in Wasabi S3, proceed with download
			if (!fs.existsSync(outputPath)) {
				await ytdl(url, {
					format,
					output: outputPath,
					mergeOutputFormat: "mp4",
				});
				console.log("Download successful:", outputPath);
			}

			// Upload the file to Wasabi S3
			const fileBuffer = fs.readFileSync(outputPath);
			await s3
				.putObject({
					Bucket: bucketName,
					Key: s3Key,
					Body: fileBuffer,
					ContentType: type === "audio" ? "audio/mpeg" : "video/mp4",
				})
				.promise();
			console.log("Upload successful");

			// Get the file download URL
			const downloadURL = s3.getSignedUrl("getObject", {
				Bucket: bucketName,
				Key: s3Key,
				Expires: 60 * 60 * 24, // 1 day expiry
			});

			// Delete the file from the server
			if (fs.existsSync(outputPath)) {
				fs.unlinkSync(outputPath);
				console.log("Local file deleted:", outputPath);
			}

			return NextResponse.json({ downloadURL }, { status: 200 });
		}
	} catch (error: any) {
		console.error("Error processing request:", error);
		return NextResponse.json(
			{ error: "Download or upload failed", details: error.message },
			{ status: 500 }
		);
	}
}
