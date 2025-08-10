'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import nProgress from 'nprogress';
import { logout } from '@/lib/auth';
import Logo from '@/components/Logo'; // Assuming you have a Logo component

// NOTE: All original props and logic are preserved.
const navigationItems = [
	{
		category: 'Peer-to-Peer',
		items: [
			{ name: 'Dashboard', href: '/user', icon: 'ri-dashboard-line' },
			{ name: 'My Network', href: '/user/network', icon: 'ri-team-line' },
			{ name: 'Provide Help', href: '/user/provide-help', icon: 'ri-hand-heart-line' },
			{ name: 'Get Help', href: '/user/get-help', icon: 'ri-question-answer-line' },
			{ name: 'Testimonies', href: '/user/testimonials', icon: 'ri-chat-quote-line' },
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
			{ name: 'Add Momo Details', href: '/user/add-momo-details', icon: 'ri-bank-line' },
			{ name: 'Change Password', href: '/user/change-password', icon: 'ri-lock-line' },
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
		if (onClose) onClose();
		nProgress.start();
		router.push(href);
	};

	const handleLogout = async () => {
		if (onClose) onClose();
		nProgress.start();
		await logout();
		router.push('/auth/login');
	};

	return (
		<aside className="w-64 min-h-screen bg-white text-gray-800 flex flex-col border-r border-gray-200">
			<div className="flex-shrink-0 px-6 pt-6 pb-4">
				<div className="flex items-center justify-between">
					<Logo alt="logo" size="sm" />
					{onClose && (
						<button onClick={onClose} className="lg:hidden p-1 rounded-md hover:bg-gray-100 transition-colors" aria-label="Close sidebar">
							<i className="ri-close-line text-xl text-gray-500"></i>
						</button>
					)}
				</div>
			</div>
			<nav className="flex-1 overflow-y-auto px-4 pb-8 space-y-6">
				{navigationItems.map((section) => (
					<ul className="!mt-0" key={section.category}>
						{section.items.map((item) => (
							<li key={item.name} className="">
								<button
									onClick={() => handleNavigation(item.href)}
									className={cn('w-full flex items-center gap-3 px-4 py-1.5 sm:py-2.5 rounded-md text-sm transition-colors duration-150 group', pathname === item.href ? 'bg-teal-50 text-teal-600 font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900')}
								>
									<i className={cn(item.icon, 'text-lg', pathname === item.href ? 'text-teal-500' : 'text-gray-400 group-hover:text-gray-600')}></i>
									<span>{item.name}</span>
								</button>
							</li>
						))}
					</ul>
				))}
			</nav>
			<div className="px-4 py-4 border-t border-gray-200">
				<button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors group">
					<i className="ri-logout-box-line text-lg text-gray-400 group-hover:text-gray-600"></i>
					<span>Log Out</span>
				</button>
			</div>
		</aside>
	);
}
