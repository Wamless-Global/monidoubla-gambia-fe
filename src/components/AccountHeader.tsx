'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import Logo from './Logo';

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
		setMounted(true);
	}, []);

	const toggleTheme = () => {
		setTheme(theme === 'light' ? 'dark' : 'light');
	};

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

	if (!mounted) {
		return (
			<header className="bg-card border-b border-border px-4 lg:px-6 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors">
							<i className="ri-menu-line w-5 h-5 flex items-center justify-center text-foreground"></i>
						</button>

						<h1 className="text-xl lg:text-2xl font-bold text-foreground">{title}</h1>
					</div>

					<div className="flex items-center gap-2">
						<button className="p-2 hover:bg-accent rounded-lg transition-colors">
							<i className="ri-sun-line w-5 h-5 flex items-center justify-center text-foreground"></i>
						</button>

						<button onClick={onNotificationClick} className="p-2 hover:bg-accent rounded-lg relative transition-colors">
							<i className="ri-notification-3-line w-5 h-5 flex items-center justify-center text-foreground"></i>
							<span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full bg-red-300 dark:bg-red-500 p-3 font-semibold flex justify-center items-center">{unreadNotifications}</span>
						</button>
					</div>
				</div>
			</header>
		);
	}

	return (
		<header className="bg-card border-b border-border px-4 lg:px-6 py-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4 relative">
					<button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors">
						<i className="ri-menu-line w-5 h-5 flex items-center justify-center text-foreground"></i>
					</button>

					<div className="flex items-center">
						<Logo size="sm" variant="default" alt="" className="" />
					</div>
					<h1 className="text-xl lg:text-2xl font-bold text-foreground">{title}</h1>
					<div id="google_translate_element" className=""></div>
				</div>

				<div className="flex items-center gap-2">
					<button onClick={toggleTheme} className="p-2 hover:bg-accent rounded-lg transition-colors" title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
						{theme === 'light' ? <i className="ri-moon-line w-5 h-5 flex items-center justify-center text-foreground"></i> : <i className="ri-sun-line w-5 h-5 flex items-center justify-center text-foreground"></i>}
					</button>

					<button onClick={onNotificationClick} className="p-2 hover:bg-accent rounded-lg relative transition-colors">
						<i className="ri-notification-3-line w-5 h-5 flex items-center justify-center text-foreground"></i>
						<span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full bg-red-300 dark:bg-red-500 p-3 font-bold flex justify-center items-center">{unreadNotifications}</span>
					</button>
				</div>
			</div>
		</header>
	);
}
