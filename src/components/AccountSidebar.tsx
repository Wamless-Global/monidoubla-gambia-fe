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

// Modern, glassmorphism, dark gradient, icon-first, interactive sidebar
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
		<aside className="w-72 h-screen max-h-screen flex flex-col p-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-black shadow-2xl border-r border-white/10 relative z-40 overflow-hidden">
			{/* Branding */}
			<div className="flex items-center justify-between px-6 pt-8 pb-4 mb-2 shrink-0">
				<div className="flex items-center gap-3">
					<div className="flex flex-col">
						<span className="text-xl font-extrabold text-white tracking-tight leading-tight">Monidoublagambia</span>
						<span className="text-xs font-medium text-indigo-200 tracking-wide">User Portal</span>
					</div>
				</div>
				{onClose && (
					<button onClick={onClose} className="lg:hidden p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
						<i className="ri-close-line w-6 h-6 text-white"></i>
					</button>
				)}
			</div>
			<div className="px-6 pb-2 shrink-0">
				<div className="h-1 rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 opacity-40 blur-sm" />
			</div>
			{/* Navigation */}
			<div className="flex-1 min-h-0 overflow-y-auto px-2 py-2">
				<nav>
					{navigationItems.map((section, idx) => (
						<div key={section.category} className="mb-6">
							<h3 className="text-xs font-bold text-indigo-200 mb-3 uppercase tracking-widest pl-3 opacity-80">{section.category}</h3>
							<ul className="space-y-2">
								{section.items.map((item) => (
									<li key={item.name}>
										<button
											onClick={() => handleNavigation(item.href)}
											className={cn(
												'w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-base font-semibold transition-all duration-200 group relative',
												pathname === item.href
													? 'bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-800 text-white shadow-lg scale-105 ring-2 ring-indigo-400/40'
													: 'bg-white/5 text-indigo-100 hover:bg-gradient-to-r hover:from-indigo-800 hover:to-blue-900 hover:text-white hover:scale-105 hover:shadow-xl hover:ring-2 hover:ring-indigo-400/30',
												'backdrop-blur-md'
											)}
										>
											<span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-blue-500 shadow group-hover:scale-110 group-hover:shadow-lg transition-all">
												<i className={`${item.icon} text-lg text-white drop-shadow`}></i>
											</span>
											<span className="flex-1 text-left tracking-wide">{item.name}</span>
										</button>
									</li>
								))}
							</ul>
							{idx < navigationItems.length - 1 && <div className="my-5 h-0.5 rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 opacity-20 blur-sm" />}
						</div>
					))}
				</nav>
			</div>
			{/* Floating glassmorphism effect */}
			<div className="absolute inset-0 pointer-events-none z-[-1]">
				<div className="absolute left-10 top-10 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-indigo-500/10 rounded-full blur-3xl" />
				<div className="absolute right-0 bottom-0 w-32 h-32 bg-gradient-to-tr from-blue-500/20 to-indigo-500/10 rounded-full blur-2xl" />
			</div>
		</aside>
	);
}
