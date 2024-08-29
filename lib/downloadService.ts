import ytdl from "ytdl-core";

export async function getVideoInfo(url: string) {
	try {
		const info = await ytdl.getInfo(url);
		return {
			title: info.videoDetails.title,
			formats: info.formats.map((format) => ({
				itag: format.itag,
				qualityLabel: format.qualityLabel,
				container: format.container,
			})),
		};
	} catch (error) {
		console.error("Error fetching video info:", error);
		throw new Error("Failed to fetch video information");
	}
}

export function getDownloadStream(url: string, itag: string) {
	return ytdl(url, { quality: itag });
}
