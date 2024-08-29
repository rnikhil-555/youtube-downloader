import { NextResponse } from "next/server";
import ytdl from "ytdl-core";

export async function POST(request: Request) {
	const { url } = await request.json();

	try {
		const info = await ytdl.getInfo(url);
		return NextResponse.json({
			title: info.videoDetails.title,
			formats: info.formats.map((format) => ({
				itag: format.itag,
				qualityLabel: format.qualityLabel,
				container: format.container,
			})),
		});
	} catch (error) {
		return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
	}
}
