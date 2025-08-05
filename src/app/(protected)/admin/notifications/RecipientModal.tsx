'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { handleFetchMessage } from '@/lib/helpers';

interface User {
	id: string;
	name: string;
	email: string;
	role: string;
	status: string;
}

interface RecipientModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelect: (recipients: User[] | 'all') => void;
	currentSelection: User[] | 'all';
}

export function RecipientModal({ isOpen, onClose, onSelect, currentSelection }: RecipientModalProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
	const [sendToAll, setSendToAll] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const [users, setUsers] = useState<User[]>([]);
	const [usersLoading, setUsersLoading] = useState(false);
	const [usersError, setUsersError] = useState<string | null>(null);

	// Fetch users from API
	useEffect(() => {
		if (!isOpen) return;
		setUsersLoading(true);
		setUsersError(null);
		fetchWithAuth(`/api/users/all?searchTerm=${encodeURIComponent(searchTerm)}`)
			.then(async (res) => {
				if (!res.ok) {
					throw new Error(handleFetchMessage(await res.json(), 'Failed to fetch users'));
				}
				const data = await res.json();
				setUsers(Array.isArray(data?.data?.users) ? data.data.users : []);
			})
			.catch((err) => {
				setUsers([]);
				setUsersError('Failed to load users');
				toast.error(handleFetchMessage(err, 'Failed to load users'));
				logger.error('Failed to load users', err);
			})
			.finally(() => setUsersLoading(false));
	}, [isOpen, searchTerm]);

	const filteredUsers = users;

	useEffect(() => {
		if (isOpen) {
			if (currentSelection === 'all') {
				setSendToAll(true);
				setSelectedUsers([]);
			} else {
				setSendToAll(false);
				setSelectedUsers(currentSelection);
			}
		}
	}, [isOpen, currentSelection]);

	const handleUserToggle = (user: User) => {
		if (sendToAll) return;

		setSelectedUsers((prev) => {
			const exists = prev.find((u) => u.id === user.id);
			if (exists) {
				return prev.filter((u) => u.id !== user.id);
			} else {
				return [...prev, user];
			}
		});
	};

	const handleSendToAllToggle = () => {
		setSendToAll(!sendToAll);
		if (!sendToAll) {
			setSelectedUsers([]);
		}
	};

	const handleSelect = () => {
		setIsLoading(true);
		setTimeout(() => {
			onSelect(sendToAll ? 'all' : selectedUsers);
			setIsLoading(false);
			onClose();
		}, 500);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
					<h2 className="text-xl font-semibold text-gray-900 dark:text-white">Select Recipients</h2>
					<button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
						<i className="ri-close-line w-5 h-5 flex items-center justify-center text-gray-600 dark:text-gray-400"></i>
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-hidden flex flex-col">
					{/* Search and Send to All */}
					<div className="p-6 border-b dark:border-gray-700 space-y-4">
						<div className="relative">
							<i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
							<input
								type="text"
								placeholder="Search users by name or email..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
							/>
						</div>

						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								id="sendToAll"
								checked={sendToAll}
								onChange={handleSendToAllToggle}
								className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
							/>
							<label htmlFor="sendToAll" className="text-sm font-medium text-gray-900 dark:text-white">
								Send to all users ({users.length} users)
							</label>
						</div>
					</div>

					{/* Users List */}
					<div className="flex-1 overflow-y-auto p-6">
						{usersLoading ? (
							<div className="text-center text-gray-500 dark:text-gray-400">Loading users...</div>
						) : usersError ? (
							<div className="text-center text-red-500">{usersError}</div>
						) : (
							<div className="space-y-2">
								{filteredUsers.map((user) => (
									<div
										key={user.id}
										className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
											sendToAll
												? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-60 cursor-not-allowed'
												: selectedUsers.find((u) => u.id === user.id)
												? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
												: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
										}`}
										onClick={() => handleUserToggle(user)}
									>
										<input
											type="checkbox"
											checked={sendToAll || selectedUsers.find((u) => u.id === user.id) !== undefined}
											readOnly
											className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
										/>
										<div className="flex-1">
											<div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
											<div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
										</div>
										<div className="flex items-center gap-2">
											<span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'PH' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'}`}>{user.role}</span>
											<span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>{user.status}</span>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between p-6 border-t dark:border-gray-700">
					<div className="text-sm text-gray-500 dark:text-gray-400">{sendToAll ? `All ${users.length} users selected` : `${selectedUsers.length} users selected`}</div>
					<div className="flex items-center gap-3">
						<Button variant="outline" onClick={onClose} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
							Cancel
						</Button>
						<Button onClick={handleSelect} disabled={isLoading || (!sendToAll && selectedUsers.length === 0)} className="bg-blue-600 hover:bg-blue-700 text-white">
							{isLoading ? (
								<>
									<i className="ri-loader-4-line animate-spin w-4 h-4 flex items-center justify-center mr-2"></i>
									Selecting...
								</>
							) : (
								'Select Recipients'
							)}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
