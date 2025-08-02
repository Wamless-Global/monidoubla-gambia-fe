'use client';

import Image from 'next/image';

export default function ContactHero() {
	return (
		<section className="py-16 sm:py-24 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 mt-16 sm:mt-0">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					<div className="space-y-6 text-center lg:text-left">
						<h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-indigo-600 dark:text-indigo-400 font-clash-display">Contact Us</h1>
						<p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-montserrat leading-relaxed max-w-lg mx-auto lg:mx-0">Get in touch with our team for any questions or support you need</p>
					</div>
					<div>
						<Image src="/images/hero.png" alt="Customer support illustration" width={800} height={400} className="w-full h-auto rounded-xl shadow-xl" />
					</div>
				</div>
			</div>
		</section>
	);
}
