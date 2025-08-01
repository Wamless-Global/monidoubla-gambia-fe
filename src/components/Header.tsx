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
		<header className="sticky top-0 z-50 bg-transparent backdrop-blur-lg border-b border-indigo-200/30">
			<nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
				<div className="flex items-center justify-between w-full md:w-auto">
					<CustomLink href="/">
						<Logo size="xl" variant="default" alt="" />
					</CustomLink>
					<button className="md:hidden text-indigo-600 dark:text-indigo-400 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-lg" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}>
						<i className={`${isMenuOpen ? 'ri-close-line' : 'ri-menu-line'} text-2xl`}></i>
					</button>
				</div>

				<div className="hidden md:flex items-center gap-8">
					{['Home', 'About Us', 'Contact Us', 'FAQs'].map((link, index) => (
						<CustomLink key={index} href={link === 'Home' ? '/' : `/${link.toLowerCase().replace(' ', '-')}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-poppins text-lg transition-all hover:scale-105">
							{link}
						</CustomLink>
					))}
					<div id="google_translate_element" className="ml-4"></div>
				</div>

				<div className="hidden md:flex items-center gap-4">
					<CustomLink href="/auth/login">
						<Button variant="outline" size="lg" className="text-indigo-600 dark:text-indigo-400 border-indigo-400 hover:bg-indigo-400 hover:text-white font-poppins text-lg px-6 py-2 rounded-full transition-all hover:scale-105">
							Login
						</Button>
					</CustomLink>
					<CustomLink href="/auth/signup">
						<Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-poppins text-lg px-6 py-2 rounded-full transition-all hover:scale-105">
							Get Started
						</Button>
					</CustomLink>
				</div>

				{isMenuOpen && (
					<div className="md:hidden w-full bg-indigo-50 dark:bg-indigo-900/90 absolute top-full left-0 p-6 flex flex-col gap-4">
						{['Home', 'About Us', 'Contact Us', 'FAQs'].map((link, index) => (
							<CustomLink key={index} href={link === 'Home' ? '/' : `/${link.toLowerCase().replace(' ', '-')}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-poppins text-lg" onClick={() => setIsMenuOpen(false)}>
								{link}
							</CustomLink>
						))}
						<CustomLink href="/auth/login">
							<Button variant="outline" size="lg" className="w-full text-indigo-600 dark:text-indigo-400 border-indigo-400 hover:bg-indigo-400 hover:text-white font-poppins text-lg rounded-full" onClick={() => setIsMenuOpen(false)}>
								Login
							</Button>
						</CustomLink>
						<CustomLink href="/auth/signup">
							<Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-poppins text-lg rounded-full" onClick={() => setIsMenuOpen(false)}>
								Get Started
							</Button>
						</CustomLink>
					</div>
				)}
			</nav>
		</header>
	);
}
