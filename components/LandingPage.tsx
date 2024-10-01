import { useState } from "react";

const LandingPage = () => {
	const [url, setUrl] = useState("");

	const handleInputChange = (e: any) => {
		setUrl(e.target.value);
	};

	const handleDownload = () => {
		if (!url) return;
		console.log("Download initiated for URL: ", url);
		// Add download logic here
	};

	return (
		<div className="min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
			<div className="text-center space-y-8">
				<h1 className="text-5xl font-extrabold text-white">
					YouTube Video Downloader
				</h1>
				<p className="text-xl text-gray-200">
					Fast and easy way to download videos
				</p>

				<div className="relative max-w-lg mx-auto">
					<input
						type="text"
						placeholder="Paste YouTube link here..."
						className="w-full px-5 py-3 rounded-full text-gray-700 shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-300"
						value={url}
						onChange={handleInputChange}
					/>
					<button
						onClick={handleDownload}
						className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-indigo-600 p-3 rounded-full text-white hover:bg-indigo-700 transition duration-300"
					>
						&gt;
					</button>
				</div>

				<div className="text-gray-300 mt-10">
					<p>Copy a video link and start downloading in seconds!</p>
				</div>
			</div>
		</div>
	);
};

export default LandingPage;
