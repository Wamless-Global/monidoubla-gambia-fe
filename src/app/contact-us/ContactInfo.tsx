'use client';

import { CustomLink } from '@/components/CustomLink';

export default function ContactInfo() {
	return (
		<section className="py-16 sm:py-24 bg-indigo-900 text-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-8 sm:mb-12">
					<h2 className="text-3xl sm:text-4xl font-bold text-white font-clash-display">Monidoublagambia</h2>
					<p className="text-base sm:text-lg text-gray-300 font-montserrat mt-4 max-w-2xl mx-auto">Mission statement is team-based value of financial freedom only can truly be in one goal.</p>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
					<div className="text-center">
						<div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
							<i className="ri-phone-line text-white text-2xl"></i>
						</div>
						<h3 className="text-lg sm:text-xl font-bold text-red-400 font-poppins mb-2">Phone</h3>
						<p className="text-gray-300 text-sm sm:text-base font-montserrat">+234 908 826 5038</p>
					</div>
					<div className="text-center">
						<div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
							<i className="ri-mail-line text-white text-2xl"></i>
						</div>
						<h3 className="text-lg sm:text-xl font-bold text-red-400 font-poppins mb-2">Email</h3>
						<p className="text-gray-300 text-sm sm:text-base font-montserrat">info@Monidoublagambia.com</p>
					</div>
					<div className="text-center">
						<div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
							<i className="ri-map-pin-line text-white text-2xl"></i>
						</div>
						<h3 className="text-lg sm:text-xl font-bold text-red-400 font-poppins mb-2">Address</h3>
						<p className="text-gray-300 text-sm sm:text-base font-montserrat">Office address</p>
					</div>
				</div>
				<div className="text-center mt-8 sm:mt-12">
					<div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
						{[
							{ icon: 'ri-facebook-fill', href: '#' },
							{ icon: 'ri-twitter-fill', href: '#' },
							{ icon: 'ri-linkedin-fill', href: '#' },
							{ icon: 'ri-whatsapp-fill', href: '#' },
						].map((social, index) => (
							<CustomLink key={index} href={social.href} className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-700 transition-all hover:scale-110">
								<i className={`${social.icon} text-white text-lg`}></i>
							</CustomLink>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
