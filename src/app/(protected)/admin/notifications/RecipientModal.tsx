'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
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

	useEffect(() => {
		if (!isOpen) return;
		setUsersLoading(true);
		setUsersError(null);
		fetchWithAuth(`/api/users/all?searchTerm=${encodeURIComponent(searchTerm)}`)
			.then(async (res) => {
				if (!res.ok) throw new Error(handleFetchMessage(await res.json(), 'Failed to fetch users'));
				const data = await res.json();
				setUsers(Array.isArray(data?.data?.users) ? data.data.users : []);
			})
			.catch((err) => {
				setUsers([]);
				setUsersError('Failed to load users');
				toast.error(handleFetchMessage(err, 'Failed to load users'));
			})
			.finally(() => setUsersLoading(false));
	}, [isOpen, searchTerm]);

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
		setSelectedUsers((prev) => (prev.find((u) => u.id === user.id) ? prev.filter((u) => u.id !== user.id) : [...prev, user]));
	};

	const handleSendToAllToggle = () => {
		setSendToAll(!sendToAll);
		if (!sendToAll) setSelectedUsers([]);
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
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in-0 !m-0">
			<Card className="max-w-2xl w-full bg-white shadow-lg border-slate-200 animate-in fade-in-0 zoom-in-95 max-h-[90vh] flex flex-col">
				<CardHeader>
					<div className="flex justify-between items-start">
						<div>
							<CardTitle>Select Recipients</CardTitle>
							<CardDescription>Choose who should receive this broadcast.</CardDescription>
						</div>
						<button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100">
							<i className="ri-close-line text-xl"></i>
						</button>
					</div>
				</CardHeader>
				<CardContent className="flex-1 flex flex-col overflow-hidden p-6 pt-0">
					<div className="space-y-4 pb-4 border-b">
						<div className="relative">
							<i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
							<input type="text" placeholder="Search users by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10" />
						</div>
						<div className="flex items-center gap-2">
							<input type="checkbox" id="sendToAll" checked={sendToAll} onChange={handleSendToAllToggle} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
							<label htmlFor="sendToAll" className="text-sm font-medium text-slate-700">
								Send to all users ({users.length} users)
							</label>
						</div>
					</div>
					<div className="flex-1 overflow-y-auto -mx-6 px-6 pt-4">
						{usersLoading ? (
							<div className="text-center text-slate-500">Loading users...</div>
						) : usersError ? (
							<div className="text-center text-red-500">{usersError}</div>
						) : (
							<div className="space-y-2">
								{users.map((user) => (
									<div
										key={user.id}
										className={cn(
											'flex items-center gap-3 p-2 rounded-lg border transition-colors cursor-pointer',
											sendToAll ? 'bg-slate-50 opacity-60 cursor-not-allowed' : selectedUsers.some((u) => u.id === user.id) ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:bg-slate-50'
										)}
										onClick={() => handleUserToggle(user)}
									>
										<input type="checkbox" checked={sendToAll || selectedUsers.some((u) => u.id === user.id)} readOnly className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
										<img src={`https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}`} alt={user.name} className="w-8 h-8 rounded-full" />
										<div className="flex-1">
											<div className="font-medium text-slate-800">{user.name}</div>
											<div className="text-sm text-slate-500">{user.email}</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</CardContent>
				<CardFooter className="justify-between items-center">
					<p className="text-sm text-slate-500">{sendToAll ? `All ${users.length} users selected` : `${selectedUsers.length} users selected`}</p>
					<div className="flex items-center gap-3">
						<Button variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button onClick={handleSelect} disabled={isLoading || (!sendToAll && selectedUsers.length === 0)}>
							{isLoading ? 'Selecting...' : 'Select Recipients'}
						</Button>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
