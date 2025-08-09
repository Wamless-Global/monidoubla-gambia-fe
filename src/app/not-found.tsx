'use client';

import { CustomLink } from '@/components/CustomLink';
import { Button } from '@/components/ui/button';

export default function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
			<div className="max-w-md w-full text-center">
				<div className="mb-8">
					<h1 className="text-6xl font-bold text-indigo-600">404</h1>
					<h2 className="text-2xl font-semibold text-slate-800 mt-2">Page Not Found</h2>
					<p className="text-slate-500 mt-2">Sorry, we couldn't find the page you're looking for.</p>
				</div>

				<div className="space-y-3">
					<CustomLink href="/">
						<Button className="w-full">
							<i className="ri-home-4-line mr-2"></i>
							Go to Homepage
						</Button>
					</CustomLink>
					<Button variant="outline" onClick={() => window.history.back()} className="w-full">
						<i className="ri-arrow-left-line mr-2"></i>
						Go Back
					</Button>
				</div>

				<div className="text-sm text-slate-500 mt-8">
					<p>
						If you think this is a mistake, please{' '}
						<CustomLink href="/contact-us" className="font-medium text-indigo-600 hover:underline">
							contact support
						</CustomLink>
						.
					</p>
				</div>
			</div>
		</div>
	);
}
