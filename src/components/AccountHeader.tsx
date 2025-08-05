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
	const [mounted, setMounted] = useState(false);
	const title = pageTitle[pathname as keyof typeof pageTitle] || 'Account';

	useEffect(() => {
		setMounted(true);
	}, []);

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
			<header className="bg-[#1F2A44] border-b border-gray-200 dark:border-gray-800 px-4 lg:px-8 py-4 shadow-sm">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4 min-w-0">
						<button onClick={onMenuClick} className="lg:hidden p-2 rounded-md hover:bg-[#223055] focus:bg-[#223055] transition-colors" aria-label="Open menu">
							<i className="ri-menu-line w-5 h-5 flex items-center justify-center text-white"></i>
						</button>
						<Logo size="sm" variant="default" alt="" className="mr-2" />
						<span className="font-poppins text-lg font-semibold text-white truncate">{title}</span>
					</div>
					<div className="flex items-center gap-4">
						<button onClick={onNotificationClick} className="relative p-2 rounded-md hover:bg-[#223055] focus:bg-[#223055] transition-colors" aria-label="Notifications">
							<i className="ri-notification-3-line w-5 h-5 flex items-center justify-center text-white"></i>
							{unreadNotifications > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#4F46E5] text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-[#1F2A44]">{unreadNotifications}</span>}
						</button>
					</div>
				</div>
			</header>
		);
	}

	return (
		<header className="bg-[#1F2A44] border-b border-gray-200 dark:border-gray-800 px-4 lg:px-8 py-4 shadow-sm">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4 min-w-0">
					<button onClick={onMenuClick} className="lg:hidden p-2 rounded-md hover:bg-[#223055] focus:bg-[#223055] transition-colors" aria-label="Open menu">
						<i className="ri-menu-line w-5 h-5 flex items-center justify-center text-white"></i>
					</button>
					{/* <Logo size="sm" variant="default" alt="" className="mr-2" /> */}
					<span className="font-poppins text-lg font-semibold text-white truncate">{title}</span>
					<div id="google-translate-script"></div>
				</div>
				<div className="flex items-center gap-4">
					<button onClick={onNotificationClick} className="relative p-2 rounded-md hover:bg-[#223055] focus:bg-[#223055] transition-colors" aria-label="Notifications">
						<i className="ri-notification-3-line w-5 h-5 flex items-center justify-center text-white"></i>
						{unreadNotifications > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#4F46E5] text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-[#1F2A44]">{unreadNotifications}</span>}
					</button>
				</div>
			</div>
		</header>
	);
}
