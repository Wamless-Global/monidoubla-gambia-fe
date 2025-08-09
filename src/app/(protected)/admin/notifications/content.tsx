'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { RecipientModal } from './RecipientModal';
import { TopUpModal } from './TopUpModal';
import { logger } from '@/lib/logger';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { toast } from 'sonner';
import { handleFetchMessage } from '@/lib/helpers';
import { cn } from '@/lib/utils';

// NOTE: All original interfaces and logic are preserved.
interface User {
	id: string;
	name: string;
	email: string;
	role: string;
	status: string;
}

export default function NotificationsPage() {
	const [messageTitle, setMessageTitle] = useState('');
	const [messageContent, setMessageContent] = useState('');
	const [senderId, setSenderId] = useState('');
	const [selectedRecipients, setSelectedRecipients] = useState<User[] | 'all'>([]);
	const [smsBalance, setSmsBalance] = useState(40000);
	const [isRecipientModalOpen, setIsRecipientModalOpen] = useState(false);
	const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
	const [isSending, setIsSending] = useState(false);
	const [sendOptions, setSendOptions] = useState({ sms: false, email: false, inApp: true });

	const handleSendOptionChange = (option: keyof typeof sendOptions) => {
		setSendOptions((prev) => {
			const newOptions = { ...prev, [option]: !prev[option] };

			// Clear sender ID if no SMS or email selected
			if (!newOptions.sms && !newOptions.email) {
				setSenderId('');
			}

			// Clear title if only SMS is selected
			if (newOptions.sms && !newOptions.email && !newOptions.inApp) {
				setMessageTitle('');
			}

			return newOptions;
		});
	};

	const handleRecipientSelect = (recipients: User[] | 'all') => {
		setSelectedRecipients(recipients);
	};

	const handleTopUp = (amount: number, method: string) => {
		setSmsBalance((prev) => prev + amount);
		// In a real app, this would integrate with a payment processor
		logger.log(`Top up ${amount} credits via ${method}`);
	};

	const handleSendMessage = async () => {
		if (!messageContent.trim()) return;
		if (selectedRecipients.length === 0 && selectedRecipients !== 'all') return;
		if (!sendOptions.sms && !sendOptions.email && !sendOptions.inApp) return;

		setIsSending(true);
		try {
			// Build delivery method array
			const deliveryMethod: string[] = [];
			if (sendOptions.sms) deliveryMethod.push('sms');
			if (sendOptions.email) deliveryMethod.push('email');
			if (sendOptions.inApp) deliveryMethod.push('inApp');

			// Build recipient array or 'all'
			let recipient: string[] | 'all' = 'all';
			if (selectedRecipients !== 'all') {
				recipient = selectedRecipients.map((u) => u.id);
			}

			const payload: any = {
				title: messageTitle,
				message: messageContent,
				sender_id: senderId,
				delivery_method: deliveryMethod,
				recipient,
				send_sms: sendOptions.sms,
				send_email: sendOptions.email,
				send_in_app: sendOptions.inApp,
			};

			const res = await fetchWithAuth('/api/notifications/new', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const data = await res.json();
			if (!res.ok || data.status === 'error') {
				const errorMsg = handleFetchMessage(data, 'Failed to send message.');
				toast.error(errorMsg);
				return;
			}
			setMessageTitle('');
			setMessageContent('');
			setSenderId('');
			setSelectedRecipients([]);
			setSendOptions({ sms: false, email: false, inApp: false });
			toast.success('Message sent successfully!');
		} catch (err: any) {
			toast.error(handleFetchMessage(err, 'Failed to send message.'));
		} finally {
			setIsSending(false);
		}
	};

	const getRecipientText = () => {
		if (selectedRecipients === 'all') return 'All users';
		if (selectedRecipients.length === 0) return 'Select recipients';
		if (selectedRecipients.length === 1) return selectedRecipients[0].name;
		return `${selectedRecipients.length} users selected`;
	};

	return (
		<div className="space-y-6">
			<header>
				<h1 className="text-3xl font-bold text-slate-800">Notifications & Broadcast</h1>
				<p className="text-slate-500 mt-1">Send messages to your users via In-App, Email, or SMS.</p>
			</header>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
				{/* Main Composer Column */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Message Composer</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<button onClick={() => setIsRecipientModalOpen(true)} className="w-full flex items-center justify-between p-3 border border-slate-300 rounded-lg text-left hover:bg-slate-50">
								<div className="flex items-center gap-3">
									<i className="ri-group-line text-xl text-slate-400"></i>
									<div>
										<p className="text-sm font-medium text-slate-500">Recipients</p>
										<p className="font-semibold text-slate-800">{getRecipientText()}</p>
									</div>
								</div>
								<i className="ri-arrow-down-s-line text-lg text-slate-400"></i>
							</button>
							<div>
								<label>Title</label>
								<input type="text" value={messageTitle} onChange={(e) => setMessageTitle(e.target.value)} placeholder="Enter message title" />
							</div>
							<div>
								<label>Message Content</label>
								<textarea value={messageContent} onChange={(e) => setMessageContent(e.target.value)} placeholder="Type your message here..." rows={8} className="resize-none" />
							</div>
							<div>
								<label>Delivery Channels</label>
								<div className="flex flex-wrap gap-4 mt-2">
									<label className="flex items-center gap-2">
										<input type="checkbox" checked={sendOptions.inApp} onChange={() => handleSendOptionChange('inApp')} />
										<span>In-App</span>
									</label>
									<label className="flex items-center gap-2">
										<input type="checkbox" checked={sendOptions.email} onChange={() => handleSendOptionChange('email')} />
										<span>Email</span>
									</label>
									<label className="flex items-center gap-2">
										<input type="checkbox" checked={sendOptions.sms} onChange={() => handleSendOptionChange('sms')} />
										<span>SMS</span>
									</label>
								</div>
							</div>
							{(sendOptions.sms || sendOptions.email) && (
								<div>
									<label>Sender ID (Optional)</label>
									<input type="text" value={senderId} onChange={(e) => setSenderId(e.target.value)} placeholder="e.g. YourBrand" />
								</div>
							)}
						</CardContent>
						<CardFooter className="justify-end">
							<Button onClick={handleSendMessage} disabled={isSending || !messageContent.trim() || (selectedRecipients.length === 0 && selectedRecipients !== 'all')} className="min-w-[150px]">
								{isSending ? 'Sending...' : 'Send Message'}
							</Button>
						</CardFooter>
					</Card>
				</div>

				{/* Right Sidebar Column */}
				<div className="lg:col-span-1 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>SMS Balance</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-3xl font-bold text-slate-800">{smsBalance.toLocaleString()}</p>
							<p className="text-sm text-slate-500">credits remaining</p>
						</CardContent>
						<CardFooter>
							<Button onClick={() => setIsTopUpModalOpen(true)} variant="outline" className="w-full">
								Top Up Credits
							</Button>
						</CardFooter>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Preview</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="p-4 bg-slate-50 rounded-lg min-h-[12rem] text-sm text-slate-700">
								{messageTitle && <p className="font-bold mb-2">{messageTitle}</p>}
								<p className="whitespace-pre-wrap">{messageContent || <span className="text-slate-400">Your message preview will appear here.</span>}</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			<RecipientModal isOpen={isRecipientModalOpen} onClose={() => setIsRecipientModalOpen(false)} onSelect={handleRecipientSelect} currentSelection={selectedRecipients} />
			<TopUpModal isOpen={isTopUpModalOpen} onClose={() => setIsTopUpModalOpen(false)} onTopUp={handleTopUp} currentBalance={smsBalance} />
		</div>
	);
}
