'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import nProgress from 'nprogress';
import { logout } from '@/lib/auth';

const navigationItems = [
	{
		category: 'Peer-to-Peer',
		items: [
			{ name: 'Dashboard', href: '/user', icon: 'ri-dashboard-line' },
			{ name: 'My Network', href: '/user/network', icon: 'ri-team-line' },
			{ name: 'Provide Help', href: '/user/provide-help', icon: 'ri-hand-heart-line' }, // Changed to a more suitable icon
			{ name: 'Get Help', href: '/user/get-help', icon: 'ri-question-answer-line' }, // Changed to a more suitable icon
			{ name: 'Testimonies', href: '/user/testimonials', icon: 'ri-chat-quote-line' }, // Changed to a more suitable icon
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
		<aside className="w-72 min-h-screen bg-[#1F2A44] text-gray-100 flex flex-col shadow-lg border-r border-gray-200 dark:border-gray-800">
			<div className="flex-shrink-0 px-6 pt-8 pb-4">
				<div className="flex items-center justify-between">
					<span className="font-poppins text-lg font-bold tracking-tight text-white">Account</span>
					{onClose && (
						<button onClick={onClose} className="lg:hidden p-2 rounded-md hover:bg-gray-800 focus:bg-gray-800 transition-colors" aria-label="Close sidebar">
							<i className="ri-close-line w-5 h-5 flex items-center justify-center"></i>
						</button>
					)}
				</div>
			</div>
			<nav className="flex-1 overflow-y-auto px-2 pb-8">
				{navigationItems.map((section) => (
					<div key={section.category} className="">
						<ul className="space-y-1">
							{section.items.map((item) => (
								<li key={item.name}>
									<button
										onClick={() => handleNavigation(item.href)}
										className={cn(
											'w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm font-inter transition-colors duration-150',
											pathname === item.href ? 'bg-white text-[#1F2A44] font-semibold shadow-sm' : 'text-gray-100 hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white'
										)}
									>
										<i className={`${item.icon} w-5 h-5 flex items-center justify-center text-[#4B5563] group-hover:text-[#4F46E5] transition-colors`}></i>
										<span className="text-sm font-medium tracking-tight">{item.name}</span>
									</button>
								</li>
							))}
						</ul>
					</div>
				))}
			</nav>
		</aside>
	);
}
