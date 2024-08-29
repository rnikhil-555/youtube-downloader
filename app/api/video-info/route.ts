import { getVideoInfo } from "@/lib/downloadService";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	const { url } = await request.json();

	try {
		const info = await getVideoInfo(url);
		return NextResponse.json(info);
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to fetch video info" },
			{ status: 400 }
		);
	}
}
