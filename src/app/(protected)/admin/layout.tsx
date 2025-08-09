'use client';

import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminHeader } from '@/components/AdminHeader';
import { NotificationPanel } from '@/components/NotificationPanel';
import { usePathname } from 'next/navigation';
import { getCurrentUser } from '@/lib/userUtils';
import './admin.css';

// NOTE: All original logic is preserved.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [notificationOpen, setNotificationOpen] = useState(false);
	const [unreadNotifications, setUnreadNotifications] = useState(0);
	const pathname = usePathname();

	useEffect(() => {
		setSidebarOpen(false); // Close mobile sidebar on route change
	}, [pathname]);

	return (
		<div className="flex h-screen bg-slate-100">
			{/* Desktop Sidebar */}
			<div className="hidden lg:block lg:flex-shrink-0">
				<AdminSidebar />
			</div>

			{/* Mobile Sidebar */}
			<div className={`fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
				<AdminSidebar onClose={() => setSidebarOpen(false)} />
			</div>
			{sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

			{/* Main Content */}
			{/* FIX: Added `min-w-0` to allow this flex container to shrink, preventing x-overflow */}
			<div className="flex-1 flex flex-col min-w-0">
				<AdminHeader onMenuClick={() => setSidebarOpen(true)} onNotificationClick={() => setNotificationOpen(true)} unreadNotifications={unreadNotifications} />
				<main className="flex-1 overflow-y-auto">
					<div className="p-4 sm:p-6 lg:p-8">{children}</div>
				</main>
			</div>

			<NotificationPanel isOpen={notificationOpen} onClose={() => setNotificationOpen(false)} userId={getCurrentUser()?.id || ''} handleUnread={setUnreadNotifications} />
		</div>
	);
}
