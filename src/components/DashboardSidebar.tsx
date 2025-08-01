'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { CustomLink } from './CustomLink';

const navigationItems = [
	{
		category: 'Peer-to-Peer',
		items: [
			{ name: 'Dashboard', href: '/dashboard', icon: 'ri-dashboard-line' },
			{ name: 'My Network', href: '/network', icon: 'ri-team-line' },
			{ name: 'PH History', href: '/ph-history', icon: 'ri-history-line' },
			{ name: 'GH History', href: '/gh-history', icon: 'ri-file-list-line' },
		],
	},
	{
		category: 'E-commerce',
		items: [
			{ name: 'Marketplace', href: '/marketplace', icon: 'ri-store-line' },
			{ name: 'My Listings', href: '/my-listings', icon: 'ri-list-check' },
			{ name: 'Add New Product', href: '/add-product', icon: 'ri-add-box-line' },
		],
	},
	{
		category: 'User Management',
		items: [
			{ name: 'Profile', href: '/profile', icon: 'ri-user-line' },
			{ name: 'Add Bank Account', href: '/add-bank', icon: 'ri-bank-line' },
			{ name: 'Change Password', href: '/change-password', icon: 'ri-lock-line' },
			{ name: 'Log Out', href: '/logout', icon: 'ri-logout-box-line' },
		],
	},
];

interface DashboardSidebarProps {
	onClose?: () => void;
}

export function DashboardSidebar({ onClose }: DashboardSidebarProps) {
	const pathname = usePathname();

	return (
		<div className="w-64 bg-blue-900 text-white min-h-screen p-4 flex flex-col">
			<div className="mb-8 flex-shrink-0">
				<div className="flex items-center justify-between mb-2">
					<div className="flex items-center gap-2">
						<i className="ri-wallet-line w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center text-xl lg:text-2xl"></i>
						<h1 className="text-lg lg:text-xl font-bold font-clash">MONIDOUBLA</h1>
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
									<CustomLink href={item.href} className={cn('flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm cursor-pointer', pathname === item.href ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800 hover:text-white')}>
										<i className={`${item.icon} w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center`}></i>
										<span className="text-xs lg:text-sm">{item.name}</span>
									</CustomLink>
								</li>
							))}
						</ul>
					</div>
				))}
			</nav>
		</div>
	);
}
