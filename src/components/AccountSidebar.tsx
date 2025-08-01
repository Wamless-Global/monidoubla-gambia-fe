'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import nProgress from 'nprogress';
import { logout } from '@/lib/auth';
import Logo from './Logo';

const navigationItems = [
	{
		category: 'Peer-to-Peer',
		items: [
			{ name: 'Dashboard', href: '/user', icon: 'ri-dashboard-line' },
			{ name: 'My Network', href: '/user/network', icon: 'ri-team-line' },
			{ name: 'Provide Help', href: '/user/provide-help', icon: 'ri-history-line' },
			{ name: 'Get Help', href: '/user/get-help', icon: 'ri-file-list-line' },
		],
	},
	{
		category: 'E-commerce',
		items: [
			{ name: 'Marketplace', href: '/user/marketplace', icon: 'ri-store-line' },
			{ name: 'My Listings', href: '/user/my-listings', icon: 'ri-list-check' },
			{ name: 'Add New Product', href: '/user/add-product', icon: 'ri-add-box-line' },
		],
	},
	{
		category: 'User Management',
		items: [
			{ name: 'Profile', href: '/user/profile', icon: 'ri-user-line' },
			{ name: 'Add Bank Account', href: '/user/add-bank', icon: 'ri-bank-line' },
			{ name: 'Change Password', href: '/user/change-password', icon: 'ri-lock-line' },
			{ name: 'Log Out', href: '#', icon: 'ri-logout-box-line' },
		],
	},
];

interface AccountSidebarProps {
	onClose?: () => void;
}

export function AccountSidebar({ onClose }: AccountSidebarProps) {
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
		<div className="w-64 bg-blue-900 text-white min-h-screen p-4 flex flex-col">
			<div className="mb-8 flex-shrink-0">
				<div className="flex items-center justify-between mb-2">
					<div className="flex items-center gap-2">
						<Logo size="xl" variant="default" alt="" />
					</div>
					{onClose && (
						<button onClick={onClose} className="lg:hidden p-2 hover:bg-blue-800 rounded-lg transition-colors">
							<i className="ri-close-line w-5 h-5 flex items-center justify-center"></i>
						</button>
					)}
				</div>
			</div>

			<nav className="space-y-6 flex-1 overflow-y-auto">
				{navigationItems.map((section) => (
					<div key={section.category}>
						<h3 className="text-xs lg:text-sm font-semibold text-blue-200 mb-3 uppercase tracking-wider">{section.category}</h3>
						<ul className="space-y-1">
							{section.items.map((item) => (
								<li key={item.name}>
									<button
										onClick={() => handleNavigation(item.href)}
										className={cn('w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm cursor-pointer text-left', pathname === item.href ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800 hover:text-white')}
									>
										<i className={`${item.icon} w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center`}></i>
										<span className="text-xs lg:text-sm">{item.name}</span>
									</button>
								</li>
							))}
						</ul>
					</div>
				))}
			</nav>
		</div>
	);
}
