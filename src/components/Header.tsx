'use client';

import { useEffect, useState } from 'react';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import { CustomLink } from './CustomLink';

export default function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	useEffect(() => {
		window.googleTranslateElementInit = function () {
			if (window.google?.translate?.TranslateElement) {
				new window.google.translate.TranslateElement({ pageLanguage: 'en' }, 'google_translate_element');
			}
		};

		if (!document.getElementById('google-translate-script')) {
			const script = document.createElement('script');
			script.id = 'google-translate-script';
			script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
			script.async = true;
			document.body.appendChild(script);
		}

		return () => {
			delete window.googleTranslateElementInit;
		};
	}, []);

	return (
		<header className="fixed top-0 left-0 right-0 z-50 bg-neutral-dark/80 backdrop-blur-sm py-2">
			<nav className="container flex items-center justify-between h-16">
				<div className="flex items-center space-x-4">
					<CustomLink href="/">
						<Logo size="xl" variant="default" alt="" />
					</CustomLink>
					<div id="google_translate_element" className="ml-4"></div>
				</div>

				<div className="hidden md:flex items-center space-x-8">
					<CustomLink href="/" className="text-neutral-light hover:text-white">
						Home
					</CustomLink>
					<CustomLink href="/about-us" className="text-neutral-light hover:text-white">
						About Us
					</CustomLink>
					<CustomLink href="/contact-us" className="text-neutral-light hover:text-white">
						Contact Us
					</CustomLink>
					<CustomLink href="/faqs" className="text-neutral-light hover:text-white">
						FAQs
					</CustomLink>
				</div>

				<div className="hidden md:flex items-center space-x-4">
					<CustomLink href="/auth/login">
						<Button className="button button-secondary text-white">Login</Button>
					</CustomLink>
					<CustomLink href="/auth/signup">
						<Button className="button button-primary">Get Started</Button>
					</CustomLink>
				</div>

				<button className="md:hidden text-white p-2" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Open menu">
					<i className={`${isMenuOpen ? 'ri-close-line' : 'ri-menu-line'} text-xl`}></i>
				</button>

				{isMenuOpen && (
					<div className="md:hidden fixed inset-0 z-50 flex items-center justify-center">
						<div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-blue-900/80 to-purple-800/80 backdrop-blur-2xl" />
						<div className="relative w-full max-w-xs mx-auto rounded-3xl shadow-2xl bg-white/10 border border-white/20 p-8 flex flex-col items-center space-y-6 animate-fade-in">
							<button className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors text-2xl focus:outline-none" onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
								<i className="ri-close-line"></i>
							</button>
							<CustomLink href="/" className="text-white text-xl font-semibold hover:text-blue-200 transition-colors" onClick={() => setIsMenuOpen(false)}>
								Home
							</CustomLink>
							<CustomLink href="/about-us" className="text-white text-xl font-semibold hover:text-blue-200 transition-colors" onClick={() => setIsMenuOpen(false)}>
								About Us
							</CustomLink>
							<CustomLink href="/contact-us" className="text-white text-xl font-semibold hover:text-blue-200 transition-colors" onClick={() => setIsMenuOpen(false)}>
								Contact Us
							</CustomLink>
							<CustomLink href="/faqs" className="text-white text-xl font-semibold hover:text-blue-200 transition-colors" onClick={() => setIsMenuOpen(false)}>
								FAQs
							</CustomLink>
							<CustomLink href="/auth/login" onClick={() => setIsMenuOpen(false)} className="w-full">
								<Button className="button button-secondary w-full max-w-xs mt-2">Login</Button>
							</CustomLink>
							<CustomLink href="/auth/signup" onClick={() => setIsMenuOpen(false)} className="w-full">
								<Button className="button button-primary w-full max-w-xs">Get Started</Button>
							</CustomLink>
						</div>
					</div>
				)}
			</nav>
		</header>
	);
}
