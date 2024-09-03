import YouTubeDownloader from "@/components/YoutubeDownloader";
// import {ChevronDown} from ""
export default function Home() {
	return (
		<>
			<header className="flex items-center justify-between p-4 border-b border-gray-700">
				<div className="text-xl font-bold text-blue-400">ytdl</div>
				<nav className="flex items-center space-x-4">
					<a href="#" className="text-white">
						Youtube Downloader
					</a>
				</nav>
			</header>
			<div className="px-4">
				<YouTubeDownloader />;
			</div>
		</>
	);
}
