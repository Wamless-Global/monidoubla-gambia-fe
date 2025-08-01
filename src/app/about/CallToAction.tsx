'use client';

import { CustomLink } from '@/components/CustomLink';
import { Button } from '@/components/ui/button';

export default function CallToAction() {
	return (
		<section className="py-16 sm:py-20 bg-blue-900">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
				<div className="max-w-3xl mx-auto">
					<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">Ready to Start Your Journey?</h2>
					<p className="text-lg sm:text-xl text-blue-200 mb-8 leading-relaxed">Join thousands of community members who are already building wealth through giving. Start your journey towards financial freedom today.</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
						<CustomLink href={`/auth/signup`} className="w-full sm:w-auto">
							<Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold w-full sm:w-auto">
								Get Started Now
							</Button>
						</CustomLink>

						<CustomLink href={`/about`} className="w-full sm:w-auto">
							<Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-blue-900 px-8 py-4 text-lg font-semibold w-full sm:w-auto">
								Learn More
							</Button>
						</CustomLink>
					</div>
				</div>
			</div>
		</section>
	);
}
