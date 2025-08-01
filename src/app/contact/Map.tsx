'use client';

export default function Map() {
	return (
		<section className="py-20 bg-gray-50">
			<div className="max-w-7xl mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-4xl font-bold text-gray-800 mb-4">Find Us</h2>
					<p className="text-xl text-gray-600">Visit our office or get in touch with us</p>
				</div>

				<div className="bg-white rounded-2xl shadow-lg overflow-hidden">
					<div className="aspect-video">
						<iframe
							src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.8267107550903!2d-0.20452968571428!3d5.603716935139205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9084b2b7a773%3A0x8b4b3b3b3b3b3b3b!2sAccra%2C%20Ghana!5e0!3m2!1sen!2sus!4v1234567890123"
							width="100%"
							height="100%"
							style={{ border: 0 }}
							allowFullScreen
							loading="lazy"
							referrerPolicy="no-referrer-when-downgrade"
							title="Monidoubla Office Location"
						></iframe>
					</div>
				</div>
			</div>
		</section>
	);
}
