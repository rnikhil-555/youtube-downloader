/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverComponentsExternalPackages: ["youtube-dl-exec", "ytdl-core"],
	},
};

export default nextConfig;
