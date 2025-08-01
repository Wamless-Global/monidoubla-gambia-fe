'use client';

export default function ContactInfo() {
	return (
		<section className="py-24 bg-blue-900 text-white">
			<div className="max-w-7xl mx-auto px-4">
				<div className="text-center mb-20">
					<h2 className="text-5xl font-bold mb-8">Monidoubla</h2>
					<p className="text-xl max-w-4xl mx-auto leading-relaxed">mission statement is team-based value of financial freedom only can truly be in one goal.</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-12">
					<div className="text-center">
						<div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
							<i className="ri-phone-line text-3xl"></i>
						</div>
						<h3 className="text-2xl font-semibold mb-4">Phone</h3>
						<p className="text-blue-200 text-lg">+234 908 826 5038</p>
					</div>

					<div className="text-center">
						<div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
							<i className="ri-mail-line text-3xl"></i>
						</div>
						<h3 className="text-2xl font-semibold mb-4">Email</h3>
						<p className="text-blue-200 text-lg">info@Monidoubla.com</p>
					</div>

					<div className="text-center">
						<div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
							<i className="ri-map-pin-line text-3xl"></i>
						</div>
						<h3 className="text-2xl font-semibold mb-4">Address</h3>
						<p className="text-blue-200 text-lg">Office address</p>
					</div>
				</div>

				<div className="text-center mt-20">
					<div className="flex justify-center space-x-8">
						<a href="#" className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
							<i className="ri-facebook-fill text-2xl"></i>
						</a>
						<a href="#" className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
							<i className="ri-twitter-fill text-2xl"></i>
						</a>
						<a href="#" className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
							<i className="ri-linkedin-fill text-2xl"></i>
						</a>
						<a href="#" className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
							<i className="ri-whatsapp-fill text-2xl"></i>
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}
