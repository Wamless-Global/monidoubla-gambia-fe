import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'avatar.vercel.sh',
			},
			{
				protocol: 'https',
				hostname: 'loremflickr.com',
			},
			{
				protocol: 'https',
				hostname: 'api.db.monidoublagh.local',
			},
			{
				protocol: 'https',
				hostname: 'woczzifzpllhrgycrano.supabase.co',
			},
			{
				protocol: 'https',
				hostname: 'auth.monidoublagh.com',
			},
			{
				protocol: 'https',
				hostname: 'readdy.ai',
			},
		],
	},
	allowedDevOrigins: ['monidoublagh.local', '*.monidoublagh.local'],
	async rewrites() {
		return [
			{
				source: '/api/:path*',
				destination: `${process.env.API_BASE_URL}/:path*`,
			},
		];
	},
};

export default nextConfig;
