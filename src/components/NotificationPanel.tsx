'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/helpers';
import { logger } from '@/lib/logger';

interface Notification {
	id: string;
	message: string;
	created_at: string;
	is_read: boolean;
	date?: string;
	action_link?: string | null;
}

interface NotificationPanelProps {
	isOpen: boolean;
	onClose: () => void;
	handleUnread: (notifications: number) => void;
	userId: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function NotificationPanel({ isOpen, onClose, handleUnread, userId }: NotificationPanelProps) {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);

	const unreadCount = notifications.filter((n) => !n.is_read).length;

	// Update unread count
	useEffect(() => {
		handleUnread(unreadCount);
	}, [unreadCount, handleUnread]);

	// Handle body scroll
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	// Fetch notifications
	useEffect(() => {
		if (!userId) return;
		let ignore = false;

		async function fetchNotifications() {
			setLoading(true);
			const { data, error } = await supabase.from('notifications').select('*').eq('recipient_id', userId).order('created_at', { ascending: false });

			if (!ignore && data) {
				setNotifications(data as Notification[]);
			}
			setLoading(false);
			if (error) logger.error('Failed to fetch notifications', error);
		}

		fetchNotifications();
		return () => {
			ignore = true;
		};
	}, [userId]);

	// Real-time subscription
	useEffect(() => {
		if (!userId) return;

		let channel: any;
		let reconnectTimeout: NodeJS.Timeout | null = null;

		const subscribe = () => {
			channel = supabase.channel(`notifications-${userId}`);
			channel
				.on(
					'postgres_changes',
					{
						event: 'INSERT',
						schema: 'public',
						table: 'notifications',
						filter: `recipient_id=eq.${userId}`,
					},
					(payload: { new: Notification }) => {
						setNotifications((prev) => [payload.new as Notification, ...prev]);
					}
				)
				.on('close', {}, () => {
					reconnectTimeout = setTimeout(() => {
						subscribe();
					}, 2000);
				})
				.subscribe();
		};

		subscribe();
		return () => {
			if (channel) channel.unsubscribe();
			if (reconnectTimeout) clearTimeout(reconnectTimeout);
		};
	}, [userId]);

	// Mark notifications as read when panel opens
	useEffect(() => {
		if (!isOpen || notifications.length === 0) return;
		const unread = notifications.filter((n) => !n.is_read);
		if (unread.length === 0) return;

		unread.forEach(async (n) => {
			try {
				await fetch(`/api/notifications/${n.id}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						is_read: true,
						read_at: new Date().toISOString(),
					}),
				});
				setNotifications((prev) => prev.map((notif) => (notif.id === n.id ? { ...notif, is_read: true, read_at: new Date().toISOString() } : notif)));
			} catch (e) {
				logger.error('Failed to mark notification as read', e);
			}
		});
	}, [isOpen, notifications]);

	const removeNotification = async (id: string) => {
		try {
			await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
			setNotifications((prev) => prev.filter((notif) => notif.id !== id));
		} catch (e) {
			logger.error('Failed to delete notification', e);
		}
	};

	const clearAllNotifications = async () => {
		try {
			await Promise.all(notifications.map((n) => fetch(`/api/notifications/${n.id}`, { method: 'DELETE' })));
			setNotifications([]);
		} catch (e) {
			logger.error('Failed to clear notifications', e);
		}
	};

	return (
		<>
			{/* Overlay */}
			{isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />}

			{/* Notification Panel */}
			<div className={`fixed top-0 right-0 h-full bg-white dark:bg-gray-800 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} w-full lg:w-96 shadow-xl`}>
				<div className="flex flex-col h-full">
					{/* Header */}
					<div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
							Notifications
							{unreadCount > 0 && <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold px-2 py-0.5">{unreadCount}</span>}
						</h2>
						<button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
							<i className="ri-close-line w-5 h-5 flex items-center justify-center text-gray-600 dark:text-gray-400"></i>
						</button>
					</div>

					{/* Notifications List */}
					<div className="flex-1 overflow-y-auto">
						{loading ? (
							<div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
								<div className="text-center">
									<p>Loading...</p>
								</div>
							</div>
						) : notifications.length === 0 ? (
							<div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
								<div className="text-center">
									<i className="ri-notification-off-line w-12 h-12 flex items-center justify-center mx-auto mb-2 text-gray-400"></i>
									<p>No notifications</p>
								</div>
							</div>
						) : (
							<div className="p-4 space-y-4">
								{notifications.map((notification) => (
									<div key={notification.id} className="group">
										{notification.date && <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">{notification.date}</div>}
										<div className={`relative bg-gray-50 dark:bg-gray-700 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${notification.is_read ? 'opacity-70' : 'opacity-100'}`}>
											<div className="flex items-start justify-between gap-3">
												<div className="flex-1">
													<a href={notification.action_link || '#'} onClick={onClose} className="text-sm text-gray-900 dark:text-white leading-relaxed hover:underline">
														{notification.message}
													</a>
													<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatRelativeTime(notification.created_at)}</p>
												</div>
												<button onClick={() => removeNotification(notification.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
													<i className="ri-close-line w-4 h-4 flex items-center justify-center text-gray-600 dark:text-gray-400"></i>
												</button>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Clear All Button */}
					{notifications.length > 0 && (
						<div className="p-4 border-t dark:border-gray-700">
							<Button variant="outline" onClick={clearAllNotifications} className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
								Clear All Notifications
							</Button>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
