'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/helpers';
import { logger } from '@/lib/logger';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
	const [clearing, setClearing] = useState(false);

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
			setClearing(true);
			await Promise.all(notifications.map((n) => fetch(`/api/notifications/${n.id}`, { method: 'DELETE' })));
			setNotifications([]);
		} catch (e) {
			logger.error('Failed to clear notifications', e);
		} finally {
			setClearing(false);
		}
	};

	return (
		<>
			{isOpen && <div className="fixed inset-0 bg-black/40 z-40 animate-in fade-in-0" onClick={onClose} />}
			<div className={`fixed top-0 right-0 h-full z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} w-full max-w-md`}>
				<Card className="h-full flex flex-col rounded-l-lg rounded-r-none border-l">
					<CardHeader className="flex-row items-center justify-between">
						<CardTitle>Notifications {unreadCount > 0 && <span className="ml-2 text-sm font-medium text-white bg-red-500 rounded-full px-2 py-0.5">{unreadCount}</span>}</CardTitle>
						<button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100">
							<i className="ri-close-line text-xl"></i>
						</button>
					</CardHeader>
					<CardContent className="flex-1 overflow-y-auto p-4 space-y-2">
						{loading ? (
							<div className="flex items-center justify-center h-full text-gray-500">Loading...</div>
						) : notifications.length === 0 ? (
							<div className="flex items-center justify-center h-full text-gray-500">
								<div className="text-center">
									<i className="ri-notification-off-line text-4xl text-gray-300 mb-2"></i>
									<p>No notifications yet</p>
								</div>
							</div>
						) : (
							notifications.map((notification) => (
								<div key={notification.id} className="group relative p-4 rounded-lg hover:bg-gray-50 transition-colors">
									<div className="flex items-start gap-4">
										{!notification.is_read && <div className="w-2.5 h-2.5 bg-teal-500 rounded-full mt-1.5 flex-shrink-0"></div>}
										<div className={cn('flex-1', notification.is_read && 'pl-[18px]')}>
											<a href={notification.action_link || '#'} onClick={onClose} className="font-medium text-gray-800 leading-snug hover:underline">
												{notification.message}
											</a>
											<p className="text-xs text-gray-500 mt-1">{formatRelativeTime(notification.created_at)}</p>
										</div>
										<button onClick={() => removeNotification(notification.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600">
											<i className="ri-close-line text-base"></i>
										</button>
									</div>
								</div>
							))
						)}
					</CardContent>
					{notifications.length > 0 && (
						<CardFooter>
							<Button
								onClick={async () => {
									setClearing(true);
									try {
										await clearAllNotifications();
									} finally {
										setClearing(false);
									}
								}}
								variant="outline"
								className="w-full"
							>
								{clearing ? (
									<>
										<i className="ri-loader-4-line animate-spin w-4 h-4 flex items-center justify-center mr-2"></i>
										Clearing...
									</>
								) : (
									<>Clear Notification</>
								)}
							</Button>
						</CardFooter>
					)}
				</Card>
			</div>
		</>
	);
}
