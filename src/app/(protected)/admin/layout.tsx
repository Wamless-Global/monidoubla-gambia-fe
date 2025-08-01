'use client';

import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminHeader } from '@/components/AdminHeader';
import { NotificationPanel } from '@/components/NotificationPanel';
import { usePathname } from 'next/navigation';
import { getCurrentUser } from '@/lib/userUtils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [notificationOpen, setNotificationOpen] = useState(false);
	const [isMounted, setIsMounted] = useState(false);
	const [unreadNotifications, setUnreadNotifications] = useState(0);

	const pathname = usePathname();

	useEffect(() => {
		// Define the callback before loading script
		window.googleTranslateElementInit = function () {
			if (window.google?.translate?.TranslateElement) {
				new window.google.translate.TranslateElement({ pageLanguage: 'en' }, 'google_translate_element');
			}
		};

		// Prevent duplicate script appending
		if (!document.getElementById('google-translate-script')) {
			const script = document.createElement('script');
			script.id = 'google-translate-script';
			script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
			script.async = true;
			document.body.appendChild(script);
		}

		return () => {
			delete window.googleTranslateElementInit;
		};
	}, []);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	useEffect(() => {
		// Close sidebar when route changes
		setSidebarOpen(false);
	}, [pathname]);

	const handleSidebarItemClick = () => {
		setSidebarOpen(false);
	};

	if (!isMounted) {
		return (
			<div className="flex h-screen ">
				<div className="flex-1 flex items-center justify-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-screen " suppressHydrationWarning={true}>
			<div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
				<AdminSidebar onClose={handleSidebarItemClick} />
			</div>

			{sidebarOpen && <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

			<div className="flex-1 flex flex-col overflow-hidden ">
				<AdminHeader onMenuClick={() => setSidebarOpen(true)} onNotificationClick={() => setNotificationOpen(true)} unreadNotifications={unreadNotifications} />

				<main className="flex-1 overflow-y-auto ">{children}</main>
			</div>

			<NotificationPanel isOpen={notificationOpen} onClose={() => setNotificationOpen(false)} userId={getCurrentUser()?.id || ''} handleUnread={setUnreadNotifications} />
		</div>
	);
}
