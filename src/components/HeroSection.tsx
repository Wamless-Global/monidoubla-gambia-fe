'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import nProgress from 'nprogress';

export default function HeroSection() {
	const router = useRouter();

	return (
		<section className="py-16 sm:py-24 bg-gray-100 dark:bg-gray-800">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					<div className="space-y-8">
						<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-indigo-600 dark:text-indigo-400 font-clash-display leading-tight">Give Generously, Earn Continuously—Start Building Wealth Through Giving</h1>
						<p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-montserrat leading-relaxed">
							Join a global donation community where your generosity doesn't just help others—it elevates you too! Get matched to give and receive help from internal sources and grow a stream of income through our transparent trust-level reward system.
						</p>
						<div className="flex flex-col sm:flex-row gap-4">
							<Button
								variant="outline"
								size="lg"
								className="text-indigo-600 dark:text-indigo-400 border-indigo-400 hover:bg-indigo-400 hover:text-white font-poppins text-lg px-8 py-3 rounded-full transition-all hover:scale-105"
								onClick={() => {
									nProgress.start();
									router.push(`/auth/login`);
								}}
							>
								Login
							</Button>
							<Button
								size="lg"
								className="bg-indigo-600 hover:bg-indigo-700 text-white font-poppins text-lg px-8 py-3 rounded-full transition-all hover:scale-105"
								onClick={() => {
									nProgress.start();
									router.push(`/auth/signup`);
								}}
							>
								Get Started
							</Button>
						</div>
					</div>
					<div className="relative">
						<img src="/images/ai-hero.jpg" alt="Community giving illustration" className="w-full h-auto rounded-xl shadow-xl" />
						<div className="absolute -bottom-4 -right-4 w-24 h-24 bg-red-400 rounded-full opacity-50"></div>
					</div>
				</div>
			</div>
			<div className="w-full h-16 bg-gradient-to-r from-indigo-600 to-red-400 mt-12"></div>
		</section>
	);
}
