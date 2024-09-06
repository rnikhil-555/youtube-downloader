import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		// Extract URL from the request body
		const { url }: { url: string } = await request.json();

		// Validate URL
		if (!url) {
			return NextResponse.json({ error: "URL is required" }, { status: 400 });
		}

		// Call the external API
		const response = await axios.get(
			`https://yt-dl-lj8v.onrender.com/decipher?url=${url}`
		);

		// Return the response from the external API
		return NextResponse.json(response.data);
	} catch (error) {
		console.error("Error fetching video info:", error);
		return NextResponse.json(
			{ error: "Invalid URL or API error" },
			{ status: 400 }
		);
	}
}
