'use client';

import { CustomLink } from '@/components/CustomLink';
import { Button } from '@/components/ui/button';

export default function ServerError() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
			<div className="max-w-md w-full text-center space-y-8">
				<div className="space-y-4">
					<h1 className="text-8xl font-bold text-red-600 dark:text-red-500 font-clash-display">500</h1>
					<h2 className="text-2xl font-semibold text-gray-900 dark:text-white font-poppins">Server Error</h2>
					<p className="text-gray-600 dark:text-gray-400 font-montserrat">Something went wrong on our end. We're working to fix the issue.</p>
				</div>

				<div className="space-y-4">
					<Button onClick={() => window.location.reload()} className="w-full bg-red-600 hover:bg-red-700 text-white font-poppins text-base flex items-center justify-center">
						<i className="ri-refresh-line w-4 h-4 mr-2"></i>
						Try Again
					</Button>

					<CustomLink href="/">
						<Button variant="outline" className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-poppins text-base flex items-center justify-center">
							<i className="ri-home-line w-4 h-4 mr-2"></i>
							Go Home
						</Button>
					</CustomLink>
				</div>

				<div className="text-sm text-gray-500 dark:text-gray-400 font-montserrat">
					<p>
						Error persists?{' '}
						<CustomLink href="/contact" className="text-red-600 dark:text-red-500 hover:underline">
							Contact support
						</CustomLink>
					</p>
				</div>
			</div>
		</div>
	);
}
