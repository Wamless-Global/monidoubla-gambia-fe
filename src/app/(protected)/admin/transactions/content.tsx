'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { TransactionModal } from './TransactionModal';
import { AddTransactionModal } from './AddTransactionModal';
import { toast } from 'sonner';
import Image from 'next/image';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';
import { handleFetchMessage } from '@/lib/helpers';
import { cn } from '@/lib/utils';

interface Transaction {
	id: string;
	phUser: string;
	ghUser: string;
	amount: string;
	dateMatched: string;
	status: 'Confirmed' | 'Paid' | 'Pending' | 'proof-submitted';
	paymentProof: string;
}

export default function TransactionsPage() {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [pageLoading, setPageLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [dateFromFilter, setDateFromFilter] = useState('');
	const [dateToFilter, setDateToFilter] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; transaction: Transaction | null }>({ isOpen: false, transaction: null });
	const [editModal, setEditModal] = useState<{ isOpen: boolean; transaction: Transaction | null }>({ isOpen: false, transaction: null });
	const [addModal, setAddModal] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [stats, setStats] = useState<any>(null);
	const [statsLoading, setStatsLoading] = useState(true);
	const [statsError, setStatsError] = useState<string | null>(null);

	const itemsPerPage = 5;

	useEffect(() => {
		const fetchStats = async () => {
			setStatsLoading(true);
			try {
				const response = await fetchWithAuth('/api/admin/stats');
				const result = await response.json();
				if (!response.ok || !result.success) {
					setStatsError('Failed to fetch stats');
					logger.error('Failed to fetch stats:', result);
				} else {
					setStats(result.data);
				}
			} catch (err) {
				setStatsError('Failed to fetch stats');
				logger.error('Failed to fetch stats:', err);
			} finally {
				setStatsLoading(false);
			}
		};

		const loadTransactions = async () => {
			setLoading(true);
			try {
				const res = await fetchWithAuth('/api/matches/all');
				if (!res.ok) throw new Error('Failed to fetch transactions');
				const data = await res.json();
				const txs: Transaction[] = (data.data.matches || []).map((item: any) => ({
					id: item.id,
					phUser: item?.userInfo?.name || item.ph_user || '',
					ghUser: item?.ghUserInfo?.name || item.gh_user || '',
					amount: item.amount ? String(item.amount) : '',
					dateMatched: item.dateMatched || item.date_matched || (item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB') : ''),
					status: item.status || 'Pending',
					paymentProof: item.paymentProof || item.proof_of_payment || '',
				}));
				setTransactions(txs);
			} catch (error) {
				toast.error('Failed to fetch transactions');
			} finally {
				setLoading(false);
			}
		};
		fetchStats();
		loadTransactions();
	}, []);

	useEffect(() => {
		let filtered = transactions;
		if (searchTerm) {
			filtered = filtered.filter((transaction) => transaction.phUser.toLowerCase().includes(searchTerm.toLowerCase()) || transaction.ghUser.toLowerCase().includes(searchTerm.toLowerCase()) || transaction.amount.toLowerCase().includes(searchTerm.toLowerCase()));
		}
		if (statusFilter) {
			filtered = filtered.filter((transaction) => transaction.status === statusFilter);
		}
		if (dateFromFilter) {
			filtered = filtered.filter((transaction) => new Date(transaction.dateMatched.split('-').reverse().join('-')) >= new Date(dateFromFilter));
		}
		if (dateToFilter) {
			filtered = filtered.filter((transaction) => new Date(transaction.dateMatched.split('-').reverse().join('-')) <= new Date(dateToFilter));
		}
		setFilteredTransactions(filtered);
		setCurrentPage(1);
	}, [searchTerm, statusFilter, dateFromFilter, dateToFilter, transactions]);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const handleResetFilters = () => {
		setSearchTerm('');
		setStatusFilter('');
		setDateFromFilter('');
		setDateToFilter('');
		toast.success('Filters reset successfully');
	};

	const handleDelete = async () => {
		if (!deleteModal.transaction) return;
		setDeleteLoading(true);
		try {
			const res = await fetchWithAuth(`/api/matches/${deleteModal.transaction.id}`, { method: 'DELETE' });
			if (!res.ok) {
				const errMsg = (await res.json())?.message || 'Failed to delete transaction.';
				throw new Error(errMsg);
			}
			setTransactions((prev) => prev.filter((t) => t.id !== deleteModal.transaction!.id));
			setDeleteModal({ isOpen: false, transaction: null });
			toast.success('Transaction deleted successfully');
		} catch (error) {
			toast.error(handleFetchMessage(error, 'Failed to delete transaction'));
		} finally {
			setDeleteLoading(false);
		}
	};

	const handleSaveTransaction = async (updatedTransaction: Transaction) => {
		try {
			const formData = new FormData();
			formData.append('phUser', updatedTransaction.phUser);
			formData.append('ghUser', updatedTransaction.ghUser);
			formData.append('amount', updatedTransaction.amount);
			formData.append('dateMatched', updatedTransaction.dateMatched);
			formData.append('status', updatedTransaction.status);
			formData.append('paymentProof', updatedTransaction.paymentProof);
			const res = await fetchWithAuth(`/api/matches/${updatedTransaction.id}`, { method: 'PUT', body: formData });
			if (!res.ok) {
				throw new Error(handleFetchMessage(await res.json(), 'Failed to update transaction.'));
			}
			setTransactions((prev) => prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t)));
			setEditModal({ isOpen: false, transaction: null });
			toast.success('Transaction updated successfully');
		} catch (error) {
			toast.error(handleFetchMessage(error, 'Failed to update transaction'));
		}
	};

	const handleAddTransaction = (newTransaction: Transaction) => {
		setTransactions((prev) => [newTransaction, ...prev]);
		setAddModal(false);
	};

	const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
	const currentTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, (currentPage - 1) * itemsPerPage + itemsPerPage);

	const getStatusVariant = (status: Transaction['status']): 'success' | 'info' | 'warning' | 'secondary' => {
		switch (status) {
			case 'Confirmed':
				return 'success';
			case 'Paid':
				return 'info';
			case 'Pending':
				return 'warning';
			case 'proof-submitted':
				return 'info';
			default:
				return 'secondary';
		}
	};

	return (
		<div className="space-y-6">
			<header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
				<div>
					<h1 className="text-3xl font-bold text-slate-800">Transactions</h1>
					<p className="text-slate-500 mt-1">View and manage all matched transactions.</p>
				</div>
				<Button onClick={() => setAddModal(true)}>
					<i className="ri-add-line mr-2"></i>Add Transaction
				</Button>
			</header>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium text-slate-500">Total PH Requests</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">{stats?.totalPhRequests?.toLocaleString() ?? '...'}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium text-slate-500">Total GH Requests</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">{stats?.totalGhRequests?.toLocaleString() ?? '...'}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium text-slate-500">Total Matches</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">{stats?.totalMatches?.toLocaleString() ?? '...'}</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<div className="flex flex-col lg:flex-row gap-4">
						<div className="relative flex-1">
							<i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
							<input type="text" placeholder="Search transactions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10" />
						</div>
						<div className="flex flex-col sm:flex-row gap-3">
							<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full sm:w-auto">
								<option value="">All Status</option>
								<option value="Confirmed">Confirmed</option>
								<option value="Paid">Paid</option>
								<option value="Pending">Pending</option>
								<option value="proof-submitted">POP Submitted</option>
							</select>
							<input type="date" value={dateFromFilter} onChange={(e) => setDateFromFilter(e.target.value)} className="w-full sm:w-auto" />
							<input type="date" value={dateToFilter} onChange={(e) => setDateToFilter(e.target.value)} className="w-full sm:w-auto" />
							<Button onClick={handleResetFilters} variant="outline" className="w-full sm:w-auto">
								Reset
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent className="p-0">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-slate-200">
							<thead className="bg-slate-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">PH User</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">GH User</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date matched</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Payment proof</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-slate-200">
								{loading ? (
									<tr>
										<td colSpan={7} className="text-center py-12 text-slate-500">
											Loading transactions...
										</td>
									</tr>
								) : currentTransactions.length === 0 ? (
									<tr>
										<td colSpan={7} className="text-center py-12 text-slate-500">
											No transactions found.
										</td>
									</tr>
								) : (
									currentTransactions.map((tx) => (
										<tr key={tx.id}>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{tx.phUser}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{tx.ghUser}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{tx.amount}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{tx.dateMatched}</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<Badge variant={getStatusVariant(tx.status)}>{tx.status}</Badge>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												{tx.paymentProof ? (
													<a href={tx.paymentProof} target="_blank" rel="noopener noreferrer">
														<Image src={tx.paymentProof} alt="Proof" width={40} height={40} className="w-10 h-10 rounded object-cover" />
													</a>
												) : (
													<span className="text-slate-400 text-xs">N/A</span>
												)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-right">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon">
															<i className="ri-more-2-fill"></i>
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem onClick={() => setEditModal({ isOpen: true, transaction: tx })}>Edit</DropdownMenuItem>
														<DropdownMenuItem onClick={() => setDeleteModal({ isOpen: true, transaction: tx })} className="text-red-600">
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</CardContent>
				{totalPages > 1 && (
					<CardFooter className="justify-between items-center">
						<p className="text-sm text-slate-500">
							Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} results
						</p>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
								<i className="ri-arrow-left-s-line"></i>
							</Button>
							<Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
								<i className="ri-arrow-right-s-line"></i>
							</Button>
						</div>
					</CardFooter>
				)}
			</Card>

			<TransactionModal isOpen={editModal.isOpen} onClose={() => setEditModal({ isOpen: false, transaction: null })} transaction={editModal.transaction} onSave={handleSaveTransaction} />
			<AddTransactionModal isOpen={addModal} onClose={() => setAddModal(false)} onAdd={handleAddTransaction} />
			<ConfirmationModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, transaction: null })} onConfirm={handleDelete} title="Delete Transaction" message={`Are you sure you want to delete this transaction?`} confirmVariant="destructive" loading={deleteLoading} />
		</div>
	);
}
