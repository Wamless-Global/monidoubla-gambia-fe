'use client';

import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

// NOTE: All original props and logic are preserved.
interface AdminHeaderProps {
	onMenuClick: () => void;
	onNotificationClick: () => void;
	unreadNotifications: number;
}

const pageTitleMap: { [key: string]: string } = {
	'/admin': 'Dashboard',
	'/admin/users': 'User Management',
	'/admin/packages': 'Packages',
	'/admin/ph-requests': 'PH Requests',
	'/admin/gh-requests': 'GH Requests',
	'/admin/notifications': 'Notifications',
	'/admin/transactions': 'Transactions',
	'/admin/settings': 'Settings',
	'/admin/marketplace': 'Marketplace Settings',
	'/admin/testimony-settings': 'Testimony Settings',
};

export function AdminHeader({ onMenuClick, onNotificationClick, unreadNotifications }: AdminHeaderProps) {
	const pathname = usePathname();
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const title = pageTitleMap[pathname] || 'Admin Panel';

	useEffect(() => {
		setMounted(true);
	}, []);

	const toggleTheme = () => {
		setTheme(theme === 'light' ? 'dark' : 'light');
	};

	if (!mounted) {
		return <header className="bg-white h-[68px] flex-shrink-0 border-b border-slate-200"></header>;
	}

	return (
		<header className="bg-white border-b border-slate-200 px-2 lg:px-6 py-3 flex-shrink-0">
			<div className="flex items-center justify-between">
				{/* Left Side: Page Title */}
				<div className="flex items-center gap-3">
					<button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 rounded-md hover:bg-slate-100" aria-label="Open menu">
						<i className="ri-menu-line text-xl text-slate-600"></i>
					</button>
					{/* <h1 className="text-xl font-semibold text-slate-800 hidden sm:block">{title}</h1> */}
				</div>

				{/* Right Side: Actions & User Menu */}
				<div className="flex items-center gap-2 sm:gap-4">
					{/* <button onClick={toggleTheme} className="p-2 h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-100" title="Toggle Theme">
						{theme === 'light' ? <i className="ri-moon-line text-lg text-slate-600"></i> : <i className="ri-sun-line text-lg text-slate-600"></i>}
					</button> */}

					<button onClick={onNotificationClick} className="relative p-2 h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-100" aria-label="Notifications">
						<i className="ri-notification-3-line text-lg text-slate-600"></i>
						{unreadNotifications > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
					</button>

					{/* User Profile Dropdown Placeholder */}
					<div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
					<button className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100">
						<img src={`https://ui-avatars.com/api/?name=Admin&background=E0E7FF&color=4338CA`} alt="Admin" className="w-8 h-8 rounded-full" />
						<div className="hidden sm:flex flex-col items-start">
							<span className="text-sm font-semibold text-slate-700">Admin User</span>
							<span className="text-xs text-slate-500">Administrator</span>
						</div>
						<i className="ri-arrow-down-s-line text-slate-500 hidden sm:block"></i>
					</button>
				</div>
			</div>
		</header>
	);
}
