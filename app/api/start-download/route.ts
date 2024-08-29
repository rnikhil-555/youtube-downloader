import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import { NextResponse } from "next/server";
import { PassThrough } from "stream";

export async function POST(request: Request) {
	const { url, format } = await request.json();

	try {
		const stream = ytdl(url, {
			filter: (format) => format.container === "mp4",
			requestOptions: {
				headers: {
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
				},
			},
		});

		const outputStream = new PassThrough();

		ffmpeg(stream).format(format).pipe(outputStream, { end: true });

		const headers = new Headers();
		headers.set(
			"Content-Disposition",
			`attachment; filename="video.${format}"`
		);
		headers.set("Content-Type", "application/octet-stream");

		return new NextResponse(outputStream, { headers });
	} catch (error) {
		console.error("Download error:", error);
		return NextResponse.json({ error: "Download failed" }, { status: 500 });
	}
}
