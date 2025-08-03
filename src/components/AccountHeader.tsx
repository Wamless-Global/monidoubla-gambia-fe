'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import Logo from './Logo';
import { useTheme } from 'next-themes';

interface AccountHeaderProps {
	onMenuClick: () => void;
	onNotificationClick: () => void;
	unreadNotifications: number;
}

const pageTitle = {
	'/user': 'Dashboard',
	'/user/dashboard': 'Dashboard',
	'/user/marketplace': 'Marketplace',
	'/user/my-listings': 'My Listings',
	'/user/add-product': 'Add New Product',
	'/user/profile': 'Profile',
	'/user/network': 'My Network',
	'/user/ph-history': 'PH History',
	'/user/gh-history': 'GH History',
	'/user/change-password': 'Change Password',
	'/user/add-bank': 'Add Bank Account',
};

export function AccountHeader({ onMenuClick, onNotificationClick, unreadNotifications }: AccountHeaderProps) {
	const pathname = usePathname();
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const title = pageTitle[pathname as keyof typeof pageTitle] || 'Account';

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
	useEffect(() => {
		setMounted(true);
	}, []);
	const toggleTheme = () => {
		setTheme(theme === 'light' ? 'dark' : 'light');
	};
	if (!mounted) {
		return null;
	}
	return (
		<header className="backdrop-blur-lg bg-gradient-to-br from-[#23272f]/90 via-[#1a2236]/80 to-[#10131a]/90 shadow-xl border-b border-white/10 sticky top-0 z-30 transition-all duration-300" style={{ WebkitBackdropFilter: 'blur(16px)', backdropFilter: 'blur(16px)' }}>
			<div className="flex items-center justify-between px-4 py-3 lg:px-8 lg:py-4">
				<div className="flex items-center gap-4">
					<button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-gold-400" aria-label="Open menu">
						<i className="ri-menu-2-line w-6 h-6 text-white"></i>
					</button>
					<Logo size="sm" variant="darkIcon" className="hidden md:block" alt="Monidoublagambia Logo" />
					<span className="text-xl font-extrabold tracking-tight text-white/90 drop-shadow-sm select-none font-sans" style={{ letterSpacing: '0.01em' }}>
						{title}
					</span>
				</div>
				<div className="flex items-center gap-4">
					<div id="google_translate_element" className="hidden lg:block" />
					<button onClick={toggleTheme} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-gold-400" aria-label="Toggle theme">
						<i className={`ri-${theme === 'light' ? 'moon' : 'sun'}-line w-6 h-6 text-white`}></i>
					</button>
					<button onClick={onNotificationClick} className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-gold-400" aria-label="Notifications">
						<i className="ri-notification-3-line w-6 h-6 text-white"></i>
						{unreadNotifications > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-gold-400 rounded-full shadow-lg"></span>}
					</button>
					<div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 via-gray-900 to-black border-2 border-white/20 flex items-center justify-center overflow-hidden shadow-md">
						<i className="ri-user-3-line text-white text-2xl"></i>
						<span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-gold-400 border-2 border-white/80 shadow" title="Online"></span>
					</div>
				</div>
			</div>
		</header>
	);
}
