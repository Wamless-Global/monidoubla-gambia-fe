'use client';

import Image from 'next/image';
export default function AboutContent() {
	return (
		<section className="py-16 sm:py-20 bg-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
					<div className="relative">
						<Image src="/images/woman.jpg" alt="Professional Woman" width={800} height={384} className="w-full h-96 object-cover object-top rounded-lg" />
					</div>
					<div>
						<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-8">How it Works</h2>
						<div className="space-y-6">
							<p className="text-lg text-gray-700 leading-relaxed">You start by selecting what tier you want to join at Ghana cedis. You also choose whichever tier you want to provide help through your personal wallet. The minimum tier is 5 LRD.</p>
							<p className="text-lg text-gray-700 leading-relaxed">The minimum amount to create a slot is 5 LRD unless you join via referral. The maximum amount is 5,000 LRD so anyone can incentivize money-go-round.</p>
							<p className="text-lg text-gray-700 leading-relaxed">
								Immediately after that, you'll need to grow or find two other people to send transactions to, then continue working as the system is very easy to use no matter what level you're at. The process continues more and more as you invite others to join (IOJ).
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
