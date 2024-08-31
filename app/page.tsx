import YouTubeDownloader from "@/components/YoutubeDownloader";
// import {ChevronDown} from ""
export default function Home() {
	return (
		<>
			<header className="flex items-center justify-between p-4 border-b border-gray-700">
				<div className="text-xl font-bold text-blue-400">yt1d.com</div>
				<nav className="flex items-center space-x-4">
					<a href="#" className="text-white">
						Youtube Downloader
					</a>
					<a href="#" className="text-white">
						Youtube To Mp4
					</a>
					<div className="relative">
						<button className="flex items-center space-x-2">
							<span>English</span>
							{/* <ChevronDown className="w-4 h-4" /> */}
						</button>
					</div>
				</nav>
			</header>
			<YouTubeDownloader />;
		</>
	);
}
