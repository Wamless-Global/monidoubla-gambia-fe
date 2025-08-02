'use client';

import { CustomLink } from '@/components/CustomLink';
import { Button } from '@/components/ui/button';

export default function MultiLevelSection() {
	return (
		<section className="py-16 sm:py-24 bg-gray-100 dark:bg-gray-800">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
				<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-indigo-600 dark:text-indigo-400 font-clash-display mb-8">Multi-level Referral</h2>
				<div className="max-w-4xl mx-auto space-y-6">
					<p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-montserrat leading-relaxed">
						Unlock the power of our <span className="font-semibold text-red-400">5-Generation Referral Bonus</span>! When you invite friends to join Monidoublagambia, you earn bonuses not just from your direct referrals, but also from the people they invite—up to five generations deep.
					</p>
					<p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-montserrat leading-relaxed">
						Grow your network and multiply your earnings: every new member in your referral tree can contribute to your bonus, whether you invited them directly or they joined through your extended network. The more your community grows, the more you benefit!
					</p>
					<p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-montserrat leading-relaxed">Start building your legacy today. Invite others, help them succeed, and enjoy rewards across five levels of connections.</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
						<CustomLink href="/auth/login">
							<Button size="lg" className="w-full sm:w-auto bg-red-400 text-white hover:bg-red-500 font-poppins text-base sm:text-lg px-8 py-3 rounded-full transition-all hover:scale-105">
								Login
							</Button>
						</CustomLink>
						<CustomLink href="/auth/signup">
							<Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-poppins text-base sm:text-lg px-8 py-3 rounded-full transition-all hover:scale-105">
								Get Started
							</Button>
						</CustomLink>
					</div>
				</div>
			</div>
		</section>
	);
}
