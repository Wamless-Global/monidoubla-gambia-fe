'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RecipientModal } from './RecipientModal';
import { TopUpModal } from './TopUpModal';
import { logger } from '@/lib/logger';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { toast } from 'sonner';
import { handleFetchMessage } from '@/lib/helpers';

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
	const [isLoading, setIsLoading] = useState(true);

	// Notification types
	const [sendOptions, setSendOptions] = useState({
		sms: false,
		email: false,
		inApp: false,
	});

	// Simulate loading
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 1200);
		return () => clearTimeout(timer);
	}, []);

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
		if (selectedRecipients.length === 0) return 'No recipients selected';
		if (selectedRecipients.length === 1) return selectedRecipients[0].name;
		return `${selectedRecipients.length} users selected`;
	};

	const renderPreview = () => {
		if (!messageContent.trim()) return 'No message to preview';

		const showTitle = messageTitle.trim() && (sendOptions.email || sendOptions.inApp);
		const showSender = senderId.trim() && (sendOptions.sms || sendOptions.email);

		if (sendOptions.sms && !sendOptions.email && !sendOptions.inApp) {
			// SMS only - no HTML, plain text
			return (
				<div className="font-mono text-sm">
					{showSender && <div className="text-gray-600 dark:text-gray-400 mb-2">From: {senderId}</div>}
					<div className="whitespace-pre-wrap">{messageContent}</div>
				</div>
			);
		}

		// Email or In-App (can contain HTML)
		return (
			<div>
				{showSender && <div className="text-gray-600 dark:text-gray-400 mb-2">From: {senderId}</div>}
				{showTitle && <div className="font-bold mb-2">{messageTitle}</div>}
				<div dangerouslySetInnerHTML={{ __html: messageContent }} />
			</div>
		);
	};

	if (isLoading) {
		return (
			<div className="p-6 space-y-8">
				{/* SMS Credit Balance Section */}
				<div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
					<div className="space-y-4">
						<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-40"></div>
						<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
					</div>
				</div>

				{/* Main Content */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Send Message Section */}
					<div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
						<div className="space-y-6">
							<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48"></div>

							{/* Message Title */}
							<div className="space-y-2">
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
								<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
							</div>

							{/* Recipient */}
							<div className="space-y-2">
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
								<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
							</div>

							{/* Message Content */}
							<div className="space-y-2">
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
								<div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
							</div>

							{/* Send Options */}
							<div className="space-y-3">
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
								<div className="flex gap-4">
									<div className="flex items-center gap-2">
										<div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
										<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
									</div>
									<div className="flex items-center gap-2">
										<div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
										<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
									</div>
									<div className="flex items-center gap-2">
										<div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
										<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
									</div>
								</div>
							</div>

							{/* Send Button */}
							<div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
						</div>
					</div>

					{/* Preview Section */}
					<div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
						<div className="space-y-4">
							<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
							<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48"></div>

							{/* Preview Box */}
							<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
								<div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-16"></div>
								<div className="space-y-2">
									<div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-full"></div>
									<div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-3/4"></div>
									<div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-1/2"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-8">
			{/* SMS Credit Balance Section */}
			<div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
				<div className="space-y-4">
					<div className="text-sm text-gray-600 dark:text-gray-400 font-medium">SMS Credit Balance</div>
					<div className="text-3xl font-bold text-gray-900 dark:text-white">{smsBalance.toLocaleString()}</div>
					<Button onClick={() => setIsTopUpModalOpen(false)} className="bg-blue-600 hover:bg-blue-700 text-white">
						Top up
					</Button>
				</div>
			</div>

			{/* Main Content */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Send Message Section */}
				<div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
					<div className="space-y-6">
						<h2 className="text-xl font-semibold text-gray-900 dark:text-white">Send Broadcast Message</h2>

						{/* Message Title - Hidden if only SMS is selected */}
						{!(sendOptions.sms && !sendOptions.email && !sendOptions.inApp) && (
							<div className="space-y-2">
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message title (optional)</label>
								<div className="relative">
									<i className="ri-edit-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
									<input
										type="text"
										value={messageTitle}
										onChange={(e) => setMessageTitle(e.target.value)}
										placeholder="e.g. Update"
										className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
									/>
								</div>
							</div>
						)}

						{/* Recipient */}
						<div className="space-y-2">
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Recipient</label>
							<button onClick={() => setIsRecipientModalOpen(true)} className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-left">
								<div className="flex items-center gap-2">
									<i className="ri-user-line w-4 h-4 flex items-center justify-center text-gray-400"></i>
									<span className="text-gray-900 dark:text-white">{getRecipientText()}</span>
								</div>
								<i className="ri-arrow-down-s-line w-4 h-4 flex items-center justify-center text-gray-400"></i>
							</button>
						</div>

						{/* Message Content */}
						<div className="space-y-2">
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message content</label>
							<div className="relative">
								<i className="ri-message-line absolute left-3 top-3 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
								<textarea
									value={messageContent}
									onChange={(e) => setMessageContent(e.target.value)}
									placeholder="Type your message"
									rows={6}
									className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
								/>
							</div>
							{sendOptions.sms && !sendOptions.email && !sendOptions.inApp && <div className="text-xs text-gray-500 dark:text-gray-400">SMS mode: HTML tags will be displayed as plain text</div>}
							{(sendOptions.email || sendOptions.inApp) && <div className="text-xs text-gray-500 dark:text-gray-400">HTML content supported for email and in-app notifications</div>}
						</div>

						{/* Sender ID - Show if SMS or Email is selected */}
						{(sendOptions.sms || sendOptions.email) && (
							<div className="space-y-2">
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sender ID</label>
								<input
									type="text"
									value={senderId}
									onChange={(e) => setSenderId(e.target.value)}
									placeholder="e.g. Monidoubla"
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
								/>
							</div>
						)}

						{/* Send Options */}
						<div className="space-y-3">
							<div className="text-sm font-medium text-gray-700 dark:text-gray-300">Send as</div>
							<div className="flex flex-wrap gap-4">
								<label className="flex items-center gap-2">
									<input
										type="checkbox"
										checked={sendOptions.sms}
										onChange={() => handleSendOptionChange('sms')}
										className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
									/>
									<span className="text-sm text-gray-700 dark:text-gray-300">SMS notification</span>
								</label>
								<label className="flex items-center gap-2">
									<input
										type="checkbox"
										checked={sendOptions.email}
										onChange={() => handleSendOptionChange('email')}
										className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
									/>
									<span className="text-sm text-gray-700 dark:text-gray-300">Email notification</span>
								</label>
								<label className="flex items-center gap-2">
									<input
										type="checkbox"
										checked={sendOptions.inApp}
										onChange={() => handleSendOptionChange('inApp')}
										className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
									/>
									<span className="text-sm text-gray-700 dark:text-gray-300">In app notification</span>
								</label>
							</div>
						</div>

						{/* Send Button */}
						<Button
							onClick={handleSendMessage}
							disabled={isSending || !messageContent.trim() || (selectedRecipients.length === 0 && selectedRecipients !== 'all') || (!sendOptions.sms && !sendOptions.email && !sendOptions.inApp)}
							className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
						>
							{isSending ? (
								<>
									<i className="ri-loader-4-line animate-spin w-4 h-4 flex items-center justify-center mr-2"></i>
									Sending message...
								</>
							) : (
								'Send message'
							)}
						</Button>
					</div>
				</div>

				{/* Preview Section */}
				<div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
					<div className="space-y-4">
						<h2 className="text-xl font-semibold text-gray-900 dark:text-white">Message preview</h2>
						<div className="text-sm text-gray-600 dark:text-gray-400">How the message might appear to users</div>

						<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[200px]">
							<div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Preview</div>
							<div className="text-gray-900 dark:text-white">{renderPreview()}</div>
						</div>

						{/* Send options indicator */}
						<div className="space-y-2">
							<div className="text-sm font-medium text-gray-700 dark:text-gray-300">Will be sent as:</div>
							<div className="flex flex-wrap gap-2">
								{sendOptions.sms && <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium">SMS</span>}
								{sendOptions.email && <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">Email</span>}
								{sendOptions.inApp && <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-xs font-medium">In-App</span>}
								{!sendOptions.sms && !sendOptions.email && !sendOptions.inApp && <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 rounded-full text-xs font-medium">No delivery method selected</span>}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Modals */}
			<RecipientModal isOpen={isRecipientModalOpen} onClose={() => setIsRecipientModalOpen(false)} onSelect={handleRecipientSelect} currentSelection={selectedRecipients} />

			<TopUpModal isOpen={isTopUpModalOpen} onClose={() => setIsTopUpModalOpen(false)} onTopUp={handleTopUp} currentBalance={smsBalance} />
		</div>
	);
}
