'use client';

import { CustomLink } from '@/components/CustomLink';
import { Button } from '@/components/ui/button';

export default function MultiLevelSection() {
	return (
		<section className="py-16 sm:py-20 bg-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
				<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-8">Multi-level Referral</h2>
				<div className="max-w-4xl mx-auto">
					<p className="text-lg text-gray-700 leading-relaxed mb-8">
						Unlock the power of our <span className="font-semibold text-blue-600">5-Generation Referral Bonus</span>! When you invite friends to join Monidoubla, you earn bonuses not just from your direct referrals, but also from the people they invite—up to five generations deep.
					</p>
					<p className="text-lg text-gray-700 leading-relaxed mb-8">
						Grow your network and multiply your earnings: every new member in your referral tree can contribute to your bonus, whether you invited them directly or they joined through your extended network. The more your community grows, the more you benefit!
					</p>
					<p className="text-lg text-gray-700 leading-relaxed mb-12">Start building your legacy today. Invite others, help them succeed, and enjoy rewards across five levels of connections.</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
						<CustomLink href={'/auth/login'}>
							<Button size="lg" className="bg-yellow-400 text-black hover:bg-yellow-500 px-8 py-4 text-lg font-semibold w-full sm:w-auto whitespace-nowrap">
								Login
							</Button>
						</CustomLink>

						<CustomLink href={'/auth/signup'}>
							<Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-4 text-lg font-semibold w-full sm:w-auto whitespace-nowrap">
								Get Started
							</Button>
						</CustomLink>
					</div>
				</div>
			</div>
		</section>
	);
}
