import { NextResponse } from "next/server";
import { getDownloadStatus } from "@/lib/downloadService";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const id = params.id;

	try {
		const status = await getDownloadStatus(id);
		return NextResponse.json(status);
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to get download status" },
			{ status: 500 }
		);
	}
}
