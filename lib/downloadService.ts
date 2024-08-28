import ytdl from "ytdl-core";
import fs from "fs";
import path from "path";

const downloads = new Map();

export async function startDownload(url: string, quality: string) {
	console.log(`Starting download for URL: ${url}, Quality: ${quality}`);

	const info = await ytdl.getInfo(url);
	const format = ytdl.chooseFormat(info.formats, { quality });

	const downloadId = Date.now().toString();
	const downloadsDir = path.join(process.cwd(), "downloads");

	// Ensure the downloads directory exists
	if (!fs.existsSync(downloadsDir)) {
		fs.mkdirSync(downloadsDir, { recursive: true });
	}

	const outputPath = path.join(
		downloadsDir,
		`${downloadId}.${format.container}`
	);

	console.log(`Saving file to: ${outputPath}`);

	const video = ytdl(url, { format });

	let downloadedBytes = 0;
	video.on("progress", (_, downloaded, total) => {
		downloadedBytes = downloaded;
		const progress = Math.round((downloaded / total) * 100);
		console.log(`Download progress: ${progress}%`);
		downloads.set(downloadId, {
			progress,
			status: "downloading",
		});
	});

	const writeStream = fs.createWriteStream(outputPath);
	video.pipe(writeStream);

	return new Promise((resolve, reject) => {
		writeStream.on("finish", () => {
			console.log("Download completed");
			downloads.set(downloadId, { progress: 100, status: "completed" });
			resolve(downloadId);
		});

		writeStream.on("error", (error) => {
			console.error("Error during download:", error);
			downloads.set(downloadId, { progress: 0, status: "error" });
			reject(error);
		});
	});
}

export async function getDownloadStatus(id: string) {
	const status = downloads.get(id) || { progress: 0, status: "not found" };
	console.log(`Download status for ${id}:`, status);
	return status;
}
