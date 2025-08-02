'use client';

export default function Map() {
	return (
		<section className="py-16 sm:py-24 bg-white dark:bg-gray-900">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-8 sm:mb-12">
					<h2 className="text-3xl sm:text-4xl font-bold text-indigo-600 dark:text-indigo-400 font-clash-display">Find Us</h2>
					<p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-montserrat mt-4 max-w-2xl mx-auto">Visit our office or get in touch with us</p>
				</div>
				<div className="rounded-xl shadow-lg overflow-hidden">
					<div className="aspect-[16/9] sm:aspect-[21/9]">
						<iframe
							src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.8267107550903!2d-0.20452968571428!3d5.603716935139205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9084b2b7a773%3A0x8b4b3b3b3b3b3b3b!2sAccra%2C%20Ghana!5e0!3m2!1sen!2sus!4v1234567890123"
							width="100%"
							height="100%"
							style={{ border: 0 }}
							allowFullScreen
							loading="lazy"
							referrerPolicy="no-referrer-when-downgrade"
							title="Monidoublagambia Office Location"
						></iframe>
					</div>
				</div>
			</div>
		</section>
	);
}
