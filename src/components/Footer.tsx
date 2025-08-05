'use client';

import Logo from './Logo';
import { Button } from '@/components/ui/button';
import { CustomLink } from './CustomLink';

export default function Footer() {
	return (
		<footer className="bg-neutral-dark text-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
				<div className="flex flex-col space-y-8 sm:space-y-12">
					<div className="flex flex-col sm:flex-row sm:justify-between gap-8">
						<div className="space-y-6 max-w-md">
							<Logo size="xl" variant="default" alt="" />
							<p className="text-gray-300 text-sm sm:text-base font-montserrat leading-relaxed">Mission statement is team-based value of financial freedom only can truly be in one goal.</p>
							<CustomLink href="/auth/signup">
								<Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-poppins text-base sm:text-lg px-6 sm:px-8 py-2 rounded-full transition-all hover:scale-105">Get Started</Button>
							</CustomLink>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
							<div className="space-y-4">
								<h3 className="text-lg sm:text-xl font-bold text-neutral-light font-clash-display">Quick Links</h3>
								<ul className="space-y-2 sm:space-y-3">
									{['Home', 'About Us', 'Contact Us', 'FAQs'].map((link, index) => (
										<li key={index}>
											<CustomLink href={link === 'Home' ? '/' : `/${link.toLowerCase().replace(' ', '-')}`} className="text-gray-300 hover:text-neutral-light font-montserrat text-sm sm:text-base transition-all hover:underline">
												{link}
											</CustomLink>
										</li>
									))}
								</ul>
							</div>
							<div className="space-y-4">
								<h3 className="text-lg sm:text-xl font-bold text-neutral-light font-clash-display">Contact</h3>
								<ul className="space-y-2 sm:space-y-3">
									<li className="flex items-start text-gray-300 text-sm sm:text-base font-montserrat">
										<i className="ri-map-pin-line mr-2 mt-1 text-neutral-light text-lg"></i>
										Office Address
									</li>
									<li className="flex items-center text-gray-300 text-sm sm:text-base font-montserrat">
										<i className="ri-phone-line mr-2 text-neutral-light text-lg"></i>
										+233 806 696 0533
									</li>
									<li className="flex items-start text-gray-300 text-sm sm:text-base font-montserrat">
										<i className="ri-mail-line mr-2 mt-1 text-neutral-light text-lg"></i>
										support@Monidoublagambia.com
									</li>
								</ul>
							</div>
						</div>
					</div>
					<div className="border-t border-neutral-light/20 mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col items-center gap-4 sm:gap-6">
						{/* <div className="flex flex-row gap-4 sm:gap-6">
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
						</div> */}
						<p className="text-gray-300 text-xs sm:text-sm font-montserrat text-center">Copyright {new Date().getFullYear()} Monidoublagambia, All Rights Reserved</p>
						<div className="flex gap-4 sm:gap-6">
							{['Privacy Policy', 'Terms & Conditions'].map((link, index) => (
								<CustomLink key={index} href="#" className="text-gray-300 hover:text-neutral-light font-montserrat text-xs sm:text-sm transition-all hover:underline">
									{link}
								</CustomLink>
							))}
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
