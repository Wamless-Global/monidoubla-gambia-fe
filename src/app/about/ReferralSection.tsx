'use client';

import Image from 'next/image';
export default function ReferralSection() {
	return (
		<section className="py-16 sm:py-20 bg-blue-400">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
					<div className="text-white">
						<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8">How Referrals Work on Monidoubla</h2>
						<div className="space-y-6">
							<p className="text-lg leading-relaxed">Through Monidoubla, there are different tiers you can join to determine your earning potential. As a tier, you are connected to a certain number of referrals that you have to get before you can get a payout to the community.</p>
							<p className="text-lg leading-relaxed">
								Once you identify your tier and how many referrals you need, you can always search for participants in the community and get a referral. People who are yet to participate in the community can also always send in their referral to earn, and then a referral can be
								gotten from their level.
							</p>
						</div>
					</div>
					<div className="relative">
						<Image src="/images/referrals.jpg" alt="Mobile Referral System" width={800} height={384} className="w-full h-96 object-cover rounded-lg shadow-lg" />
					</div>
				</div>
			</div>
		</section>
	);
}
