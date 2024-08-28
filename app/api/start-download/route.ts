// app/api/start-download/route.ts
import { NextResponse } from "next/server";
import ytdl from "ytdl-core";

export async function POST(request: Request) {
	const { url, quality } = await request.json();

	try {
		console.log(
			`Received download request for URL: ${url}, Quality: ${quality}`
		);

		// Get video info
		const info = await ytdl.getInfo(url);
		const format = ytdl.chooseFormat(info.formats, { quality: quality });

		// Set headers for file download
		const headers = new Headers();
		headers.set(
			"Content-Disposition",
			`attachment; filename="${info.videoDetails.title}.mp4"`
		);
		headers.set("Content-Type", "video/mp4");

		// Create a ReadableStream from the video
		const stream = ytdl(url, { format: format });

		// Return the stream as the response
		return new NextResponse(stream as any, { headers });
	} catch (error) {
		console.error("Failed to start download:", error);
		return NextResponse.json(
			{
				error:
					"Failed to start download. The video might be restricted or unavailable.",
			},
			{ status: 500 }
		);
	}
}
