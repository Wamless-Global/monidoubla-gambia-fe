'use client';

import { useEffect, useState } from 'react';
import { AccountSidebar } from '@/components/AccountSidebar';
import { AccountHeader } from '@/components/AccountHeader';
import { NotificationPanel } from '@/components/NotificationPanel';
import { getCurrentUser } from '@/lib/userUtils';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isNotificationOpen, setIsNotificationOpen] = useState(false);
	const [unreadNotifications, setUnreadNotifications] = useState(0);

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

	const handleOverlayClick = () => {
		setIsSidebarOpen(false);
	};

	return (
		<div className="flex h-screen bg-background">
			{/* Desktop Sidebar */}
			<div className="hidden lg:block">
				<AccountSidebar />
			</div>

			{/* Mobile Sidebar */}
			{isSidebarOpen && (
				<div className="lg:hidden fixed inset-0 z-50">
					<div className="absolute inset-0 bg-black/50" onClick={handleOverlayClick} />
					<div className="relative">
						<AccountSidebar onClose={() => setIsSidebarOpen(false)} />
					</div>
				</div>
			)}

			{/* Main Content Area */}
			<div className="flex-1 flex flex-col min-w-0">
				<AccountHeader onMenuClick={() => setIsSidebarOpen(true)} onNotificationClick={() => setIsNotificationOpen(true)} unreadNotifications={unreadNotifications} />

				<main className="flex-1 overflow-auto pb-8 md:pb-12">{children}</main>
			</div>

			{/* Notification Panel */}
			{isNotificationOpen && <NotificationPanel isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} userId={getCurrentUser()?.id || ''} handleUnread={setUnreadNotifications} />}
		</div>
	);
}
