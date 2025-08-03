'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import nProgress from 'nprogress';
import { logout } from '@/lib/auth';
import Logo from './Logo';

const navigationItems = [
	{ name: 'Dashboard', href: '/admin', icon: 'ri-dashboard-line', subText: '' },
	{ name: 'User Management', href: '/admin/users', icon: 'ri-user-line', subText: '' },
	{ name: 'Packages', href: '/admin/packages', icon: 'ri-box-3-line', subText: '' },
	{ name: 'PH Requests', href: '/admin/ph-requests', icon: 'ri-hand-heart-line', subText: 'Provide Help' },
	{ name: 'GH Requests', href: '/admin/gh-requests', icon: 'ri-gift-line', subText: 'Get Help' },
	{ name: 'Notifications', href: '/admin/notifications', icon: 'ri-notification-line', subText: '' },
	{ name: 'Transactions', href: '/admin/transactions', icon: 'ri-exchange-line', subText: '' },
	{ name: 'Settings', href: '/admin/settings', icon: 'ri-settings-line', subText: '' },
	{ name: 'Marketplace Settings', href: '/admin/marketplace', icon: 'ri-store-line', subText: '' },
	{ name: 'Testimony Settings', href: '/admin/testimony-settings', icon: 'ri-chat-quote-line', subText: '' },
	{ name: 'Log Out', href: '#', icon: 'ri-logout-box-line', subText: '' },
];

interface AdminSidebarProps {
	onClose?: () => void;
}

export function AdminSidebar({ onClose }: AdminSidebarProps) {
	const pathname = usePathname();
	const router = useRouter();

	const handleNavigation = async (href: string) => {
		if (href === '#') {
			nProgress.start();
			await logout();
			router.push('/auth/login');
			return;
		}

		if (onClose) onClose();
		nProgress.start();
		router.push(href);
	};

	return (
		<div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen p-4 flex flex-col shadow-sm">
			<div className="mb-8 flex-shrink-0">
				<div className="flex items-center justify-between mb-2">
					<div className="flex items-center gap-2">
						<Logo size="xl" alt="" />
					</div>
					{onClose && (
						<button onClick={onClose} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
							<i className="ri-close-line w-5 h-5 flex items-center justify-center text-gray-600 dark:text-gray-300"></i>
						</button>
					)}
				</div>
			</div>

			<nav className="space-y-1 flex-1 overflow-y-auto">
				{navigationItems.map((item) => (
					<button
						key={item.name}
						onClick={() => handleNavigation(item.href)}
						className={cn('flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm cursor-pointer', pathname === item.href ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700')}
					>
						<i className={`${item.icon} w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center`}></i>
						<div className="flex flex-col items-start">
							<span className="text-sm">{item.name}</span>
							<span className="text-xs">{item.subText ? `(${item.subText})` : ''}</span>
						</div>
					</button>
				))}
			</nav>
		</div>
	);
}
