'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

// NOTE: All original props and logic are preserved.
interface AccountHeaderProps {
	onMenuClick: () => void;
	onNotificationClick: () => void;
	unreadNotifications: number;
}

const pageTitleMap: { [key: string]: string } = {
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
	'/user/add-momo-details': 'Add Momo Details',
	'/user/provide-help': 'Provide Help',
	'/user/get-help': 'Get Help',
	'/user/testimonials': 'Testimonials',
};

export function AccountHeader({ onMenuClick, onNotificationClick, unreadNotifications }: AccountHeaderProps) {
	const pathname = usePathname();
	const [mounted, setMounted] = useState(false);
	const title = pageTitleMap[pathname] || 'Account';

	useEffect(() => {
		setMounted(true);
	}, []);

	// The Google Translate logic can be complex to integrate into a dynamic UI.
	// It's preserved here but may need further refinement based on its behavior.

	if (!mounted) {
		return <header className="bg-white border-b border-gray-200 px-4 lg:px-8 h-[68px] flex-shrink-0"></header>;
	}

	return (
		<header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex-shrink-0">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4 min-w-0">
					<button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 rounded-md hover:bg-gray-100" aria-label="Open menu">
						<i className="ri-menu-line text-xl text-gray-600"></i>
					</button>
					<h1 className="text-xl font-semibold text-gray-800 truncate">{title}</h1>
				</div>
				<div className="flex items-center gap-4">
					<div id="google_translate_element"></div>
					<button onClick={onNotificationClick} className="relative p-2 rounded-full hover:bg-gray-100" aria-label="Notifications">
						<i className="ri-notification-3-line text-xl text-gray-600"></i>
						{unreadNotifications > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
					</button>
				</div>
			</div>
		</header>
	);
}
