'use client';

export default function AboutHero() {
	return (
		<section className="py-16 sm:py-24 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 mt-16">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					<div className="space-y-6">
						<h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-indigo-600 dark:text-indigo-400 font-clash-display leading-tight">What Is Monidoublagambia</h1>
						<p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-montserrat leading-relaxed max-w-lg">
							Monidoublagambia is a peer-to-peer financial empowerment platform that empowers people to give whilst still allowing them to earn on their platform. We help you give into a transparent financial network whether you're giving to help others or to grow out your financial
							standing. Monidoublagambia gives you a fair and rewarding experience.
						</p>
					</div>
					<div>
						<img src="/images/img3.jpg" alt="Financial empowerment illustration" className="w-full h-auto rounded-xl shadow-xl" />
					</div>
				</div>
			</div>
		</section>
	);
}
