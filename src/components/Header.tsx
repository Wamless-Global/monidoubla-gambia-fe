'use client';

import { useEffect, useState } from 'react';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import { CustomLink } from './CustomLink';
import { cn } from '@/lib/utils';

// NOTE: All original props and logic are preserved.
export default function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10);
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	useEffect(() => {
		// Preserving Google Translate logic
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

	const navLinks = [
		{ href: '/', label: 'Home' },
		{ href: '/about-us', label: 'About Us' },
		{ href: '/contact-us', label: 'Contact Us' },
		{ href: '/faqs', label: 'FAQs' },
	];

	return (
		<>
			<header className={cn('fixed top-0 left-0 right-0 z-50 transition-all duration-300', isScrolled ? 'bg-white/80 backdrop-blur-sm shadow-sm' : 'bg-white')}>
				<nav className="container flex items-center justify-between h-20">
					<div className="flex items-center gap-6">
						<CustomLink href="/">
							<Logo alt="logo" size="md" />
						</CustomLink>
						<div className="hidden md:flex items-center gap-6">
							{navLinks.map((link) => (
								<CustomLink key={link.href} href={link.href} className="text-sm text-gray-600 hover:text-teal-600 font-medium transition-colors">
									{link.label}
								</CustomLink>
							))}
						</div>
					</div>

					<div className="flex items-center gap-2">
						<div id="google_translate_element" className="hidden sm:block"></div>
						<div className="hidden md:flex items-center gap-2">
							<CustomLink href="/auth/login">
								<Button variant="ghost">Login</Button>
							</CustomLink>
							<CustomLink href="/auth/signup">
								<Button>Get Started</Button>
							</CustomLink>
						</div>
						<Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
							<i className="ri-menu-line text-xl"></i>
						</Button>
					</div>
				</nav>
			</header>

			{/* Mobile Menu Overlay */}
			<div className={cn('fixed inset-0 z-50 bg-white transform transition-transform duration-300 md:hidden', isMenuOpen ? 'translate-x-0' : 'translate-x-full')}>
				<div className="container flex flex-col h-full">
					<div className="flex items-center justify-between h-20">
						<Logo alt="logo" size="md" />
						<Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
							<i className="ri-close-line text-2xl"></i>
						</Button>
					</div>
					<div className="flex flex-col items-center justify-center flex-grow gap-6">
						{navLinks.map((link) => (
							<CustomLink key={link.href} href={link.href} className="text-2xl text-gray-800 font-semibold" onClick={() => setIsMenuOpen(false)}>
								{link.label}
							</CustomLink>
						))}
					</div>
					<div className="py-8 space-y-3">
						<CustomLink href="/auth/login" onClick={() => setIsMenuOpen(false)} className="w-full">
							<Button variant="outline" className="w-full h-12 text-base">
								Login
							</Button>
						</CustomLink>
						<CustomLink href="/auth/signup" onClick={() => setIsMenuOpen(false)} className="w-full">
							<Button className="w-full h-12 text-base">Get Started</Button>
						</CustomLink>
					</div>
				</div>
			</div>
		</>
	);
}
