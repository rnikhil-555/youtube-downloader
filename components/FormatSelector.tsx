import React from "react";

export interface Format {
	name?: string;
	size: string;
	quality?: string;
}

export interface VideoData {
	imageSrc: string;
	title: string;
	tags: string;
	duration: string;
	audioFormats: Format[];
	videoFormats: Format[];
}

export function VideoCard({
	imageSrc,
	title,
	tags,
	duration,
	audioFormats,
	videoFormats,
}: VideoData) {
	return (
		<div className="w-full h-full">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="space-y-2">
					<h2 className="text-lg font-bold">Audio</h2>
					{audioFormats.map((format, index) => (
						<div
							key={index}
							className="flex items-center justify-between p-2 border border-gray-700 rounded text-black text-ellipsiss"
						>
							<span className="text-ellipsis overflow-hiddens">
								{format.name}
							</span>
							<span className="text-ellipsis">{format.size}</span>
							<button className="bg-green-500 p-1">DOWNLOAD</button>
						</div>
					))}
				</div>
				<div className="space-y-2">
					<h2 className="text-lg font-bold">Video</h2>
					{videoFormats.map((format, index) => (
						<div
							key={index}
							className="flex items-center justify-between p-2 border border-gray-700 rounded text-black"
						>
							<span>{format.quality}</span>
							<span>{format.size}</span>
							<button className="bg-green-500 p-1">DOWNLOAD</button>
						</div>
					))}
				</div>
			</div>
			<div className="flex flex-col items-center p-4 border border-gray-700 rounded md:flex-row md:space-x-4">
				<img
					src={imageSrc}
					alt={title}
					className="w-32 h-32 rounded"
					width="150"
					height="150"
					style={{ aspectRatio: "150/150", objectFit: "cover" }}
				/>
				<div className="flex flex-col items-start mt-4 space-y-2 md:mt-0 text-black">
					<p>{title}</p>
					<p>{tags}</p>
					<p>Duration: {duration}</p>
				</div>
			</div>
		</div>
	);
}

export default function Main() {
	const videoData: VideoData = {
		imageSrc: "/placeholder.svg",
		title: "Jabardasti ki shaadi 😢 (part-21) #shorts",
		tags: "#emotional",
		duration: "00:00:59",
		audioFormats: [{ name: "MP3", size: "0.91M" }],
		videoFormats: [
			{ quality: "1080p50 (.mp4)", size: "26.43M" },
			{ quality: "720p (.mp4)", size: "11.14M" },
			{ quality: "720p50 (.mp4)", size: "17.19M" },
			{ quality: "360p (.mp4)", size: "4.18M" },
		],
	};

	return (
		<div className="min-h-screen bg-gray-900 text-white">
			{/* Other components here */}
			<main className="flex flex-col items-center p-4 space-y-8">
				{/* Pass the dynamic data to the VideoCard component */}
				<VideoCard {...videoData} />
			</main>
		</div>
	);
}
