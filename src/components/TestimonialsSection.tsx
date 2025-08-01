'use client';

export default function TestimonialsSection() {
	const testimonials = [
		{
			name: 'Ivonne Mensah',
			role: 'Apr 12, 2024',
			content: 'Monidoubla helped me pay my school fees when I needed it most. The process was simple, and I received my payout right on time. I’ve already told my friends to join!',
		},
		{
			name: 'Phillip Baateng',
			role: 'Feb 27, 2025',
			content: 'I was amazed by the support from the community. Not only did I double my contribution, but I also made new friends. Monidoubla truly delivers on its promise.',
		},
		{
			name: 'Ama Serwaa',
			role: 'Jul 8, 2025',
			content: 'I joined out of curiosity, but Monidoubla exceeded my expectations. The transparency and quick payments make it stand out. I’m grateful for this platform!',
		},
	];

	return (
		<section className="py-16 sm:py-24 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-12 space-y-4">
					<h2 className="text-4xl sm:text-5xl font-bold text-indigo-600 dark:text-indigo-400 font-clash-display">What Our Users Are Saying</h2>
					<p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-montserrat max-w-2xl mx-auto">Real people, real results: hear how Monidoubla is changing lives through trust, giving, and community-powered growth.</p>
				</div>
				<div className="relative flex flex-col md:flex-row gap-8 justify-center">
					{testimonials.map((testimonial, index) => (
						<div key={index} className="bg-white dark:bg-gray-800 rounded-full p-8 shadow-lg border-4 border-indigo-600/20 hover:border-indigo-600 dark:hover:border-indigo-500 transition-all max-w-md">
							<div className="flex flex-col items-center gap-4">
								<div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
									<i className="ri-user-3-fill text-indigo-600 dark:text-indigo-400 text-2xl"></i>
								</div>
								<h4 className="text-lg font-bold text-gray-900 dark:text-white font-poppins">{testimonial.name}</h4>
								<p className="text-sm text-gray-500 dark:text-gray-400 font-montserrat">{testimonial.role}</p>
								<p className="text-base text-gray-600 dark:text-gray-300 font-montserrat text-center italic">"{testimonial.content}"</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
