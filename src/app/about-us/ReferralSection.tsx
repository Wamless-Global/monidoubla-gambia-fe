'use client';

import Image from 'next/image';

export default function ReferralSection() {
	return (
		<section className="py-16 sm:py-24 bg-gradient-to-r from-indigo-600 to-indigo-700">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					<div className="space-y-6">
						<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-clash-display">How Referrals Work on Monidoublagambia</h2>
						<div className="space-y-4">
							<p className="text-base sm:text-lg text-gray-200 font-montserrat leading-relaxed">
								Through Monidoublagambia, there are different tiers you can join to determine your earning potential. As a tier, you are connected to a certain number of referrals that you have to get before you can get a payout to the community.
							</p>
							<p className="text-base sm:text-lg text-gray-200 font-montserrat leading-relaxed">
								Once you identify your tier and how many referrals you need, you can always search for participants in the community and get a referral. People who are yet to participate in the community can also always send in their referral to earn, and then a referral can be
								gotten from their level.
							</p>
						</div>
					</div>
					<div>
						<Image src="/images/img6.jpg" alt="Referral system illustration" width={800} height={384} className="w-full h-auto rounded-xl shadow-xl" />
					</div>
				</div>
			</div>
		</section>
	);
}
