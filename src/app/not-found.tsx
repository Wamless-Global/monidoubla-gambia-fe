'use client';

import { CustomLink } from '@/components/CustomLink';
import { Button } from '@/components/ui/button';

export default function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
			<div className="max-w-md w-full text-center space-y-8">
				<div className="space-y-4">
					<h1 className="text-8xl font-bold text-blue-600 dark:text-blue-500 font-clash-display">404</h1>
					<h2 className="text-2xl font-semibold text-gray-900 dark:text-white font-poppins">Page Not Found</h2>
					<p className="text-gray-600 dark:text-gray-400 font-montserrat">The page you're looking for doesn't exist or has been moved.</p>
				</div>

				<div className="space-y-4">
					<CustomLink href="/">
						<Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-poppins text-base flex items-center justify-center">
							<i className="ri-home-line w-4 h-4 mr-2"></i>
							Go Home
						</Button>
					</CustomLink>

					<Button variant="outline" onClick={() => window.history.back()} className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-poppins text-base flex items-center justify-center">
						<i className="ri-arrow-left-line w-4 h-4 mr-2"></i>
						Go Back
					</Button>
				</div>

				<div className="text-sm text-gray-500 dark:text-gray-400 font-montserrat">
					<p>
						Need help?{' '}
						<CustomLink href="/contact-us" className="text-blue-600 dark:text-blue-500 hover:underline">
							Contact support
						</CustomLink>
					</p>
				</div>
			</div>
		</div>
	);
}
