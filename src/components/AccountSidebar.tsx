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
		<aside className="w-72 h-screen max-h-screen flex flex-col p-0 bg-gradient-to-br from-[#23272f] via-[#181c24] to-[#10131a] shadow-2xl border-r border-white/10 relative z-40 overflow-hidden">
			{/* Branding */}
			<div className="flex items-center justify-between px-7 pt-8 pb-4 mb-2 shrink-0">
				<div className="flex items-center gap-3">
					<Logo size="sm" variant="darkIcon" className="drop-shadow-lg" alt="Monidoublagambia Logo" />
					<div className="flex flex-col ml-2">
						<span className="text-xl font-extrabold text-white tracking-tight leading-tight font-sans">Monidoublagambia</span>
						<span className="text-xs font-semibold text-gold-400 tracking-wide uppercase">User Portal</span>
					</div>
				</div>
				{onClose && (
					<button onClick={onClose} className="lg:hidden p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
						<i className="ri-close-line w-6 h-6 text-white"></i>
					</button>
				)}
			</div>
			<div className="px-7 pb-2 shrink-0">
				<div className="h-1 rounded-full bg-gradient-to-r from-gold-400 via-slate-400 to-silver-400 opacity-40 blur-sm" />
			</div>
			{/* Navigation */}
			<div className="flex-1 min-h-0 overflow-y-auto px-2 py-2">
				<nav className="space-y-6">
					{navigationItems.map((group, idx) => (
						<div key={group.category} className="space-y-1">
							<div className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-400/80 select-none">{group.category}</div>
							<ul className="space-y-1">
								{group.items.map((item) => {
									const isActive = pathname === item.href;
									const isLogout = item.name === 'Log Out';
									return (
										<li key={item.name}>
											<button
												className={cn(
													'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-base group',
													'bg-transparent text-slate-200 hover:bg-white/5 hover:scale-[1.03] hover:shadow-gold-400/10',
													isActive && 'bg-gradient-to-r from-gold-400/10 to-slate-700/40 text-gold-400 shadow-lg',
													isLogout && 'hover:text-red-400 focus:text-red-400'
												)}
												onClick={() => handleNavigation(item.href)}
												aria-label={item.name}
											>
												<i className={cn(item.icon, 'text-xl transition-all', isActive ? 'text-gold-400' : 'text-slate-400 group-hover:text-gold-400', isLogout && 'group-hover:text-red-400')}></i>
												<span className="truncate font-sans tracking-tight">{item.name}</span>
											</button>
										</li>
									);
								})}
							</ul>
							{idx < navigationItems.length - 1 && <div className="my-3 border-t border-white/10" />}
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
