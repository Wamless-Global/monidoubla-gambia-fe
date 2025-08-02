'use client';

import Image from 'next/image';

export default function AboutContent() {
	return (
		<section className="py-16 sm:py-24 bg-white dark:bg-gray-900">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					<div className="order-2 lg:order-1">
						<Image src="/images/img5.jpg" alt="Peer-to-peer financial platform illustration" width={800} height={384} className="w-full h-auto rounded-xl shadow-xl" />
					</div>
					<div className="order-1 lg:order-2 space-y-6">
						<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-indigo-600 dark:text-indigo-400 font-clash-display">How it Works</h2>
						<div className="space-y-4">
							<p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-montserrat leading-relaxed">
								You start by selecting what tier you want to join at Ghana cedis. You also choose whichever tier you want to provide help through your personal wallet. The minimum tier is 5 LRD.
							</p>
							<p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-montserrat leading-relaxed">The minimum amount to create a slot is 5 LRD unless you join via referral. The maximum amount is 5,000 LRD so anyone can incentivize money-go-round.</p>
							<p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-montserrat leading-relaxed">
								Immediately after that, you'll need to grow or find two other people to send transactions to, then continue working as the system is very easy to use no matter what level you're at. The process continues more and more as you invite others to join (IOJ).
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
