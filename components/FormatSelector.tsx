import React, { useState, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

export interface Format {
  name?: string;
  size: string;
  quality?: string;
  url: string;
  hasAudio?: boolean;
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
			<div className="flex flex-col items-center p-4 border border-gray-700 rounded md:flex-row md:space-x-4">
				<img
					src={imageSrc}
					alt={title}
					className="w-72 rounded"
					style={{ aspectRatio: "16/9", objectFit: "cover" }}
				/>
				<div className="flex flex-col items-start mt-4 space-y-2 md:mt-0 text-white">
					<p>{title}</p>
					<p>{tags}</p>
					<p>Duration: {duration}</p>
				</div>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
				<div className="space-y-2">
					<h2 className="text-lg font-bold text-white">Audio</h2>
					{audioFormats.map((format, index) => (
						<div
							key={index}
							className="flex items-center justify-between p-2 border border-gray-700 rounded text-white text-ellipsis bg-[#373838]"
						>
							<div className="text-ellipsis overflow-hidden w-1/3">
								{format.name}
							</div>
							<div className="text-ellipsis w-1/3">{format.size}</div>
							<a
								href={format.url}
								target="_blank"
								className="bg-green-500 p-1 w-1/3 text-ellipsis text-center"
							>
								DOWNLOAD
							</a>
						</div>
					))}
				</div>
				<div className="space-y-2">
					<h2 className="text-lg font-bold text-white">Video</h2>
					{videoFormats.map((format, index) => (
						<div
							key={index}
							className="flex items-center justify-between p-2 border border-gray-700 rounded text-white bg-[#373838]"
						>
							<div className="w-1/3 text-ellipsis">{format.quality}</div>
							<div className="w-1/3 text-ellipsis">{format.size}</div>
							<a
								href={format.url}
								target="_blank"
								className="bg-green-500 p-1 w-1/3 text-ellipsis text-center"
							>
								DOWNLOAD
							</a>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
