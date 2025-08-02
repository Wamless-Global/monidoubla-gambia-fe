'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import nProgress from 'nprogress';

export default function HowItWorksSection() {
	const router = useRouter();

	const steps = [
		{
			icon: 'ri-user-add-line',
			title: 'Create an Account',
			description: 'Join our fast-growing community of donors and servers',
		},
		{
			icon: 'ri-money-dollar-circle-line',
			title: 'Make a Donation',
			description: 'Choose an amount and get matched to invest to another participant',
		},
		{
			icon: 'ri-hand-heart-line',
			title: 'Get Matched to Get Paid',
			description: 'Get matched to receive help from others in the system',
		},
		{
			icon: 'ri-coins-line',
			title: 'Earn Through Referrals',
			description: 'Earn direct and indirect multilevel bonuses',
		},
	];

	return (
		<section className="py-16 sm:py-24 bg-white dark:bg-gray-900">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
					<div className="space-y-8">
						<h2 className="text-4xl sm:text-5xl font-bold text-indigo-600 dark:text-indigo-400 font-clash-display">How It Works</h2>
						<p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-montserrat max-w-lg">Understand the simple steps to start helping, earning, and growing within our trusted peer-to-peer community.</p>
						<div className="space-y-6">
							{steps.map((step, index) => (
								<div key={index} className="flex items-start gap-4 bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
									<div className="w-12 h-12 bg-indigo-600 dark:bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
										<i className={`${step.icon} text-white text-xl`}></i>
									</div>
									<div>
										<h3 className="text-xl font-bold text-gray-900 dark:text-white font-poppins mb-2">{step.title}</h3>
										<p className="text-base text-gray-600 dark:text-gray-300 font-montserrat">{step.description}</p>
									</div>
								</div>
							))}
						</div>
						<Button
							size="lg"
							className="bg-indigo-600 hover:bg-indigo-700 text-white font-poppins text-lg px-8 py-3 rounded-full transition-all hover:scale-105"
							onClick={() => {
								nProgress.start();
								router.push(`/auth/signup`);
							}}
						>
							Get started now
						</Button>
					</div>
					<div>
						<img src="/images/img4.jpg" alt="Community collaboration illustration" className="w-full h-auto rounded-xl shadow-xl" />
					</div>
				</div>
			</div>
		</section>
	);
}
