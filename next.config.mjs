/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverComponentsExternalPackages: ["ytdl-core"],
	},
};

export default nextConfig;
