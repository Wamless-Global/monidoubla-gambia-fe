'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import nProgress from 'nprogress';
import { logout } from '@/lib/auth';
import Logo from './Logo';

// NOTE: All original props and logic are preserved.
const navigationItems = [
	{ name: 'Dashboard', href: '/admin', icon: 'ri-dashboard-line' },
	{ name: 'User Management', href: '/admin/users', icon: 'ri-group-line' },
	{ name: 'Packages', href: '/admin/packages', icon: 'ri-stack-line' },
	{ name: 'PH Requests', href: '/admin/ph-requests', icon: 'ri-arrow-up-circle-line' },
	{ name: 'GH Requests', href: '/admin/gh-requests', icon: 'ri-arrow-down-circle-line' },
	{ name: 'Notifications', href: '/admin/notifications', icon: 'ri-notification-3-line' },
	{ name: 'Transactions', href: '/admin/transactions', icon: 'ri-exchange-funds-line' },
	{ name: 'Settings', href: '/admin/settings', icon: 'ri-settings-3-line' },
	{ name: 'Marketplace', href: '/admin/marketplace', icon: 'ri-store-2-line' },
	{ name: 'Testimonies', href: '/admin/testimony-settings', icon: 'ri-chat-quote-line' },
];

interface AdminSidebarProps {
	onClose?: () => void;
}

export function AdminSidebar({ onClose }: AdminSidebarProps) {
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
		<div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full">
			<div className="flex-shrink-0 px-6 pt-6 pb-4">
				<div className="flex items-center justify-between">
					<Logo alt="Logo" size="md" variant="light" />
					{onClose && (
						<button onClick={onClose} className="lg:hidden p-1 rounded-md hover:bg-slate-800" aria-label="Close sidebar">
							<i className="ri-close-line text-xl"></i>
						</button>
					)}
				</div>
			</div>
			<nav className="flex-1 overflow-y-auto px-4 space-y-2">
				{navigationItems.map((item) => (
					<button
						key={item.name}
						onClick={() => handleNavigation(item.href)}
						className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 group relative', pathname === item.href ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 hover:text-slate-100')}
					>
						<div className={cn('absolute left-0 top-0 h-full w-1 rounded-r-full', pathname === item.href ? 'bg-indigo-500' : 'bg-transparent')} />
						<i className={cn(item.icon, 'text-lg', pathname === item.href ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300')}></i>
						<span>{item.name}</span>
					</button>
				))}
			</nav>
			<div className="px-4 py-4 border-t border-slate-800">
				<button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 transition-colors group">
					<i className="ri-logout-box-r-line text-lg text-slate-500 group-hover:text-slate-300"></i>
					<span>Log Out</span>
				</button>
			</div>
		</div>
	);
}
