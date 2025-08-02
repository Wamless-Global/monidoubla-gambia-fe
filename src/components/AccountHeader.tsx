'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
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
		<header className="relative z-30 w-full px-0 lg:px-0">
			<div className="backdrop-blur-xl bg-gradient-to-r from-purple-600/70 via-indigo-700/60 to-blue-700/60 dark:from-indigo-900/80 dark:via-purple-900/70 dark:to-slate-900/80 shadow-xl rounded-b-3xl mx-auto py-6 px-4 lg:px-10 flex items-center justify-between border-b border-white/10">
				<div id="google_translate_element" className="ml-4"></div>

				{/* Left: Logo and Menu */}
				<div className="flex items-center gap-4">
					<button onClick={onMenuClick} className="lg:hidden p-2 bg-white/20 hover:bg-white/40 rounded-xl shadow transition-all backdrop-blur-md">
						<i className="ri-menu-line w-6 h-6 flex items-center justify-center text-white"></i>
					</button>
				</div>

				{/* Center: Page Title */}
				<div className="flex-1 flex justify-center">
					<h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight drop-shadow-xl bg-gradient-to-r from-white/90 to-indigo-200/80 bg-clip-text text-transparent">{title}</h1>
				</div>

				{/* Right: User, Theme, Notifications */}
				<div className="flex items-center gap-4">
					{/* User Avatar with status */}
					{/* <div className="relative group">
						<div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-400 via-purple-400 to-blue-400 border-4 border-white/30 shadow-lg flex items-center justify-center overflow-hidden">
							<i className="ri-user-3-fill text-white text-2xl"></i>
						</div>
						<span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white animate-pulse"></span>
					</div> */}
					{/* Theme toggle */}
					{/* <button onClick={toggleTheme} className="p-2 rounded-xl bg-white/20 hover:bg-white/40 shadow transition-all backdrop-blur-md" title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
						{theme === 'light' ? <i className="ri-moon-line w-5 h-5 text-white"></i> : <i className="ri-sun-line w-5 h-5 text-white"></i>}
					</button> */}
					{/* Notifications */}
					<button onClick={onNotificationClick} className="relative p-2 rounded-xl bg-white/20 hover:bg-white/40 shadow transition-all backdrop-blur-md">
						<i className="ri-notification-3-line w-5 h-5 text-white"></i>
						{unreadNotifications > 0 && (
							<span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-400 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-bounce border-2 border-white">{unreadNotifications}</span>
						)}
					</button>
				</div>
			</div>
		</header>
	);
}
