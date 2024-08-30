import { NextResponse } from "next/server";
import ytdl from "youtube-dl-exec";
import fs from "fs";
import path from "path";
import {
	ref,
	uploadBytes,
	getDownloadURL,
	getMetadata,
} from "firebase/storage";
import { storage } from "@/config/firebaseConfig";

// Function to sanitize the filename
function sanitizeFilename(filename: string): string {
	return filename.replace(/[^a-z0-9.-]/gi, "_").toLowerCase();
}

export async function POST(request: Request) {
	const { url, type, quality, title } = await request.json();

	const sanitizedTitle = sanitizeFilename(title); // Sanitize the title

	const fileExtension = type === "audio" ? "mp3" : "mp4";
	const outputPath = path.join(
		process.cwd(),
		"public",
		"downloads",
		`${sanitizedTitle}-${quality}.${fileExtension}`
	);

	const filePathInFirebase = `downloads/${sanitizedTitle}-${quality}.${fileExtension}`;
	const fileRef = ref(storage, filePathInFirebase);

	let format = "";

	if (type === "audio") {
		format = "bestaudio";
	} else if (type === "video") {
		format = `bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]`;
	}

	try {
		// Check if the file exists in Firebase Storage
		try {
			await getMetadata(fileRef);
			// If metadata is retrieved, the file exists in Firebase Storage
			const downloadURL = await getDownloadURL(fileRef);

			// Delete the file from the server
			if (fs.existsSync(outputPath)) {
				fs.unlinkSync(outputPath);
				console.log("Local file deleted:", outputPath);
			}

			return NextResponse.json({ downloadURL }, { status: 200 });
		} catch (error: any) {
			if (error.code === "storage/object-not-found") {
				// File does not exist in Firebase Storage, proceed with download
				if (!fs.existsSync(outputPath)) {
					await ytdl(url, {
						format,
						output: outputPath,
						mergeOutputFormat: "mp4",
					});
					console.log("Download successful:", outputPath);
				}

				// Upload the file to Firebase Storage
				const fileBuffer = fs.readFileSync(outputPath);
				await uploadBytes(fileRef, fileBuffer);
				console.log("Upload successful");

				// Get the file download URL
				const downloadURL = await getDownloadURL(fileRef);

				// Delete the file from the server
				if (fs.existsSync(outputPath)) {
					fs.unlinkSync(outputPath);
					console.log("Local file deleted:", outputPath);
				}

				return NextResponse.json({ downloadURL }, { status: 200 });
			} else {
				throw error;
			}
		}
	} catch (error) {
		console.error("Error:", error);
		return NextResponse.json(
			{ error: "Download or upload failed" },
			{ status: 500 }
		);
	}
}
