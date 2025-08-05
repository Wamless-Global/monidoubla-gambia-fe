'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { Package } from '../../user/provide-help/content';
import { PHRequest } from './multiple-match/types';
import { getCurrencyFromLocalStorage, handleFetchMessage, getSettings } from '@/lib/helpers';

interface AddPHRequestModalProps {
	isOpen: boolean;
	onClose: () => void;
	packages: Package[];
	onAdd: (requests: PHRequest[]) => void;
}

export default function AddPHRequestModal({ isOpen, onClose, onAdd, packages }: AddPHRequestModalProps) {
	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
	const [amount, setAmount] = useState<number>(0);
	const [searchTerm, setSearchTerm] = useState('');
	const [pkg, setPkg] = useState('');
	const [users, setUsers] = useState<{ id: string; name: string; email: string; phoneNumber: string; location: string }[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchLoading, setSearchLoading] = useState(false);

	// Debounce function
	const debounce = useCallback((fn: (...args: any[]) => void, delay: number) => {
		let timeoutId: NodeJS.Timeout;
		return (...args: any[]) => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => fn(...args), delay);
		};
	}, []);

	// Fetch users with search term
	const fetchUsers = useCallback(async (search: string) => {
		setSearchLoading(true);
		try {
			const url = search ? `/api/users/all?searchTerm=${encodeURIComponent(search)}` : '/api/users/all';
			const res = await fetchWithAuth(url);
			const json = await res.json();
			if (!res.ok) {
				throw new Error(handleFetchMessage(await res.json(), 'Failed to  load users'));
			}
			setUsers(json.data.users || []);
		} catch (error) {
			toast.error(handleFetchMessage(error, 'Failed to load users'));
			logger.error('Failed to load users', error);
			setUsers([]);
		} finally {
			setSearchLoading(false);
		}
	}, []);

	// Debounced fetchUsers
	const debouncedFetchUsers = useCallback(debounce(fetchUsers, 300), [fetchUsers]);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
			fetchUsers(''); // Initial fetch with empty search term
		} else {
			document.body.style.overflow = 'unset';
			setSearchTerm('');
			setUsers([]);
			setSelectedUsers([]);
			setAmount(0);
		}
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	useEffect(() => {
		if (isOpen) {
			debouncedFetchUsers(searchTerm);
		}
	}, [searchTerm, isOpen, debouncedFetchUsers]);

	const handleUserToggle = (userId: string) => {
		setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (selectedUsers.length === 0 || amount <= 0) {
			toast.error('Please select at least one user and enter a valid amount');
			return;
		}

		setLoading(true);

		try {
			const newRequests: PHRequest[] = await Promise.all(
				selectedUsers.map(async (userId) => {
					const user = users.find((u) => u.id === userId)!;
					const payload = {
						user: userId,
						amount,
						status: 'pending',
						package: pkg,
					};

					const res = await fetchWithAuth('/api/ph-requests', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(payload),
					});

					const data = await res.json();
					if (!res.ok) {
						throw new Error(handleFetchMessage(data, 'Failed to create PH request'));
					}

					return {
						id: data.data.request.id,
						user: {
							id: user.id,
							name: user.name,
							username: user.name.toLowerCase().replace(/\s/g, ''),
							email: user.email,
							phoneNumber: user.phoneNumber,
							location: user.location,
						},
						amount,
						dateCreated: new Date().toISOString().split('T')[0],
						status: 'pending',
						packageName: 'Default Package',
						expectedMaturity: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
						profitPercentage: 30,
						maturityPeriod: 7,
						matchingProgress: 0,
						assignedUsers: [],
						availableAmount: amount,
					};
				})
			);

			onAdd(newRequests);
			toast.success(`${newRequests.length} PH request(s) created successfully`);

			setSelectedUsers([]);
			setAmount(0);
			setSearchTerm('');
			setLoading(false);
			onClose();
		} catch (error: any) {
			toast.error(handleFetchMessage(error, 'Failed to create requests'));
			logger.error('Failed to create PH requests', error);
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<>
			<div className="fixed inset-0 bg-black bg-opacity-50 z-50 !mt-0" onClick={onClose} />
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
					<div className="p-6">
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add PH Request</h3>
							<button onClick={onClose} disabled={loading} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50">
								<i className="ri-close-line w-5 h-5 flex items-center justify-center text-gray-600 dark:text-gray-400"></i>
							</button>
						</div>
						<form onSubmit={handleSubmit} className="space-y-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Users</label>
								<div className="mb-3">
									<div className="relative">
										<i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
										<input
											type="text"
											placeholder="Search users by name or email..."
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
											disabled={loading}
										/>
									</div>
								</div>
								<div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg">
									{searchLoading ? (
										<div className="flex items-center justify-center py-4">
											<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
											<span className="ml-2 text-gray-600 dark:text-gray-400">Searching...</span>
										</div>
									) : users.length === 0 ? (
										<div className="text-center py-4 text-gray-500 dark:text-gray-400">{searchTerm ? `No users found matching "${searchTerm}"` : 'No users available'}</div>
									) : (
										users.map((user) => (
											<label key={user.id} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
												<input
													type="checkbox"
													checked={selectedUsers.includes(user.id)}
													onChange={() => handleUserToggle(user.id)}
													className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
													disabled={loading}
												/>
												<div className="ml-3">
													<div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
													<div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
												</div>
											</label>
										))
									)}
								</div>
								<div className="mt-2 text-sm text-gray-600 dark:text-gray-400">{selectedUsers.length} user(s) selected</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Packages</label>
								<select value={pkg} onChange={(e) => setPkg(e.target.value)} className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
									<option value="">Select Package</option>
									{packages.map((pkg) => (
										<option key={pkg.id} value={pkg.id}>
											{pkg.name} ({pkg.minAmount} - {pkg.maxAmount}) {getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code}
										</option>
									))}
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount ({getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code})</label>
								<input
									type="number"
									min="1"
									step="1"
									value={amount || ''}
									onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
									placeholder="Enter amount"
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
									required
									disabled={loading}
								/>
							</div>
							<div className="flex justify-end gap-3">
								<Button type="button" variant="outline" onClick={onClose} disabled={loading} className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
									Cancel
								</Button>
								<Button type="submit" disabled={loading || selectedUsers.length === 0 || amount <= 0} className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap">
									{loading ? (
										<div className="flex items-center gap-2">
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
											<span>Creating...</span>
										</div>
									) : (
										`Create ${selectedUsers.length} Request(s)`
									)}
								</Button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</>
	);
}
