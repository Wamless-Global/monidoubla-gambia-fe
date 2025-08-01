'use client';

import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface AdminHeaderProps {
	onMenuClick: () => void;
	onNotificationClick: () => void;
	unreadNotifications: number;
}

const pageTitle = {
	'/admin': 'Dashboard',
	'/admin/users': 'User Management',
	'/admin/packages': 'Packages',
	'/admin/ph-requests': 'PH Requests',
	'/admin/gh-requests': 'GH Requests',
	'/admin/notifications': 'Notifications',
	'/admin/transactions': 'Transactions',
	'/admin/settings': 'Settings',
	'/admin/marketplace': 'Marketplace Settings',
};

export function AdminHeader({ onMenuClick, onNotificationClick, unreadNotifications }: AdminHeaderProps) {
	const pathname = usePathname();
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const title = pageTitle[pathname as keyof typeof pageTitle] || 'Admin Panel';

	useEffect(() => {
		setMounted(true);
	}, []);

	const toggleTheme = () => {
		setTheme(theme === 'light' ? 'dark' : 'light');
	};

	if (!mounted) {
		return (
			<header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-4 shadow-sm">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
							<i className="ri-menu-line w-5 h-5 flex items-center justify-center text-gray-600 dark:text-gray-300"></i>
						</button>

						<h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
					</div>

					<div className="flex items-center gap-2">
						<button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
							<i className="ri-sun-line w-5 h-5 flex items-center justify-center text-gray-600 dark:text-gray-300"></i>
						</button>

						<button onClick={onNotificationClick} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative transition-colors">
							<i className="ri-notification-3-line w-5 h-5 flex items-center justify-center text-gray-600 dark:text-gray-300"></i>
							<span className="absolute -top-1 -right-1 w-3 h-3 bg-red-300 dark:bg-red-500 p-3 font-bold flex justify-center items-center rounded-full">{unreadNotifications}</span>
						</button>
					</div>
				</div>
			</header>
		);
	}

	return (
		<header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-4 shadow-sm">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
						<i className="ri-menu-line w-5 h-5 flex items-center justify-center text-gray-600 dark:text-gray-300"></i>
					</button>

					<h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
				</div>

				<div className="flex items-center gap-2">
					<button onClick={toggleTheme} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
						{theme === 'light' ? <i className="ri-moon-line w-5 h-5 flex items-center justify-center text-gray-600 dark:text-gray-300"></i> : <i className="ri-sun-line w-5 h-5 flex items-center justify-center text-gray-600 dark:text-gray-300"></i>}
					</button>

					<button onClick={onNotificationClick} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative transition-colors">
						<i className="ri-notification-3-line w-5 h-5 flex items-center justify-center text-gray-600 dark:text-gray-300"></i>
						<span className="absolute -top-1 -right-1 w-3 h-3 bg-red-300 dark:bg-red-500 p-3 font-bold flex justify-center items-center rounded-full">{unreadNotifications}</span>
					</button>
				</div>
			</div>
		</header>
	);
}
