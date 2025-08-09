'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { TransactionModal } from './TransactionModal';
import { AddTransactionModal } from './AddTransactionModal';
import { toast } from 'sonner';
import Image from 'next/image';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';
import { handleFetchMessage } from '@/lib/helpers';

interface Transaction {
	id: string;
	phUser: string;
	ghUser: string;
	amount: string;
	dateMatched: string;
	status: 'Confirmed' | 'Paid' | 'Pending';
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
	const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; transaction: Transaction | null }>({
		isOpen: false,
		transaction: null,
	});
	const [editModal, setEditModal] = useState<{ isOpen: boolean; transaction: Transaction | null }>({
		isOpen: false,
		transaction: null,
	});
	const [addModal, setAddModal] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const itemsPerPage = 10;

	// Stats state
	const [stats, setStats] = useState<any>(null);
	const [statsLoading, setStatsLoading] = useState(true);
	const [statsError, setStatsError] = useState<string | null>(null);

	useEffect(() => {
		// Fetch stats for cards
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
		fetchStats();

		// Fetch transactions
		const loadTransactions = async () => {
			setLoading(true);
			try {
				const res = await fetchWithAuth('/api/matches/all');
				if (!res.ok) throw new Error('Failed to fetch transactions');
				const data = await res.json();
				logger.log(data);
				const txs: Transaction[] = (data.data.matches || []).map((item: any) => ({
					id: item.id,
					phUser: item?.userInfo?.name || item.ph_user || '',
					ghUser: item?.ghUserInfo?.name || item.gh_user || '',
					amount: item.amount ? String(item.amount) : '',
					dateMatched: item.dateMatched || item.date_matched || (item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB') : ''),
					status: item.status || 'Pending',
					paymentProof: item.paymentProof || item.proof_of_payment || item.proof_of_payment || '',
				}));
				setTransactions(txs);
				setFilteredTransactions(txs);
			} catch (error) {
				setTransactions([]);
				setFilteredTransactions([]);
				toast.error('Failed to fetch transactions');
			} finally {
				setLoading(false);
			}
		};
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
			filtered = filtered.filter((transaction) => {
				const transactionDate = new Date(transaction.dateMatched.split('-').reverse().join('-'));
				const filterDate = new Date(dateFromFilter);
				return transactionDate >= filterDate;
			});
		}

		if (dateToFilter) {
			filtered = filtered.filter((transaction) => {
				const transactionDate = new Date(transaction.dateMatched.split('-').reverse().join('-'));
				const filterDate = new Date(dateToFilter);
				return transactionDate <= filterDate;
			});
		}

		setFilteredTransactions(filtered);
		setCurrentPage(1);
	}, [searchTerm, statusFilter, dateFromFilter, dateToFilter, transactions]);

	const handlePageChange = async (page: number) => {
		setPageLoading(true);
		await new Promise((resolve) => setTimeout(resolve, 800));
		setCurrentPage(page);
		setPageLoading(false);
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
			const res = await fetchWithAuth(`/api/matches/${deleteModal.transaction.id}`, {
				method: 'DELETE',
			});
			if (!res.ok) {
				const errMsg = (await res.json())?.message || 'Failed to delete transaction.';
				toast.error(errMsg);
			} else {
				setTransactions((prev) => prev.filter((t) => t.id !== deleteModal.transaction!.id));
				setDeleteModal({ isOpen: false, transaction: null });
				toast.success('Transaction deleted successfully');
			}
		} catch (error) {
			toast.error('Failed to delete transaction');
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
			const res = await fetchWithAuth(`/api/matches/${updatedTransaction.id}`, {
				method: 'PUT',
				body: formData,
			});
			if (!res.ok) {
				const errMsg = handleFetchMessage(await res.json(), 'Failed to update transaction.');
				toast.error(errMsg);
				return;
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
	const startIndex = (currentPage - 1) * itemsPerPage;
	const currentTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

	const getStatusBadge = (status: Transaction['status']) => {
		const statusStyles = {
			Confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
			Paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
			Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
		};

		return <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>{status}</span>;
	};

	if (loading) {
		return (
			<div className="p-6 space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
					<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
				</div>

				{/* Search and filters */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
					<div className="flex flex-col lg:flex-row gap-4">
						<div className="flex-1">
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
						</div>
						<div className="flex flex-wrap gap-3">
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
						</div>
					</div>
				</div>

				{/* Table */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 dark:bg-gray-700">
								<tr>
									<th className="px-6 py-3 text-left">
										<div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-4"></div>
									</th>
									<th className="px-6 py-3 text-left">
										<div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-16"></div>
									</th>
									<th className="px-6 py-3 text-left">
										<div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-16"></div>
									</th>
									<th className="px-6 py-3 text-left">
										<div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-16"></div>
									</th>
									<th className="px-6 py-3 text-left">
										<div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-20"></div>
									</th>
									<th className="px-6 py-3 text-left">
										<div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-12"></div>
									</th>
									<th className="px-6 py-3 text-left">
										<div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-20"></div>
									</th>
									<th className="px-6 py-3 text-left">
										<div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-16"></div>
									</th>
								</tr>
							</thead>
							<tbody>
								{Array.from({ length: 10 }).map((_, index) => (
									<tr key={index} className="border-b border-gray-200 dark:border-gray-700">
										<td className="px-6 py-4">
											<div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-4"></div>
										</td>
										<td className="px-6 py-4">
											<div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-24"></div>
										</td>
										<td className="px-6 py-4">
											<div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-24"></div>
										</td>
										<td className="px-6 py-4">
											<div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-20"></div>
										</td>
										<td className="px-6 py-4">
											<div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-24"></div>
										</td>
										<td className="px-6 py-4">
											<div className="h-6 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-16"></div>
										</td>
										<td className="px-6 py-4">
											<div className="h-12 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-12"></div>
										</td>
										<td className="px-6 py-4">
											<div className="flex gap-2">
												<div className="h-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-8"></div>
												<div className="h-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-8"></div>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* Pagination */}
				<div className="flex justify-center">
					<div className="flex gap-2">
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-10"></div>
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-10"></div>
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-10"></div>
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-10"></div>
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-10"></div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
				{/* PH Requests Card */}
				<Card className="bg-blue-500 dark:bg-blue-600 text-white p-6 border-0 shadow-sm rounded-lg">
					<div className="flex items-center justify-between">
						<div>
							<div className="flex items-center gap-2 mb-2">
								<i className="ri-hand-heart-line w-5 h-5 flex items-center justify-center"></i>
								<span className="text-sm font-medium opacity-90">Total PH Requests</span>
							</div>
							<div className="text-3xl font-bold mb-1">{stats?.totalPhRequests?.toLocaleString() ?? '0'}</div>
							<div className="text-sm opacity-80">{stats?.percentIncrease?.phRequests ?? 0}% in the past week</div>
						</div>
					</div>
				</Card>
				{/* GH Requests Card */}
				<Card className="bg-green-500 dark:bg-green-600 text-white p-6 border-0 shadow-sm rounded-lg">
					<div className="flex items-center justify-between">
						<div>
							<div className="flex items-center gap-2 mb-2">
								<i className="ri-gift-line w-5 h-5 flex items-center justify-center"></i>
								<span className="text-sm font-medium opacity-90">Total GH Requests</span>
							</div>
							<div className="text-3xl font-bold mb-1">{stats?.totalGhRequests?.toLocaleString() ?? '0'}</div>
							<div className="text-sm opacity-80">{stats?.percentIncrease?.ghRequests ?? 0}% in the past week</div>
						</div>
					</div>
				</Card>
				{/* Matches Card */}
				<Card className="bg-pink-500 dark:bg-pink-600 text-white p-6 border-0 shadow-sm rounded-lg">
					<div className="flex items-center justify-between">
						<div>
							<div className="flex items-center gap-2 mb-2">
								<i className="ri-exchange-line w-5 h-5 flex items-center justify-center"></i>
								<span className="text-sm font-medium opacity-90">Total Matches</span>
							</div>
							<div className="text-3xl font-bold mb-1">{stats?.totalMatches?.toLocaleString() ?? '0'}</div>
							<div className="text-sm opacity-80">{stats?.percentIncrease?.matches ?? 0}% in the past week</div>
						</div>
					</div>
				</Card>
			</div>
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
				{/* <Button onClick={() => setAddModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
				<i className="ri-add-line w-4 h-4 flex items-center justify-center mr-2"></i>
				Add Transaction
			</Button> */}
			</div>

			{/* Search and Filters */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
				<div className="flex flex-col lg:flex-row gap-4">
					<div className="flex-1">
						<div className="relative">
							<i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 flex items-center justify-center"></i>
							<input
								type="text"
								placeholder="Search transactions..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
							/>
						</div>
					</div>
					<div className="flex flex-wrap gap-3">
						<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
							<option value="">All Status</option>
							<option value="Confirmed">Confirmed</option>
							<option value="Paid">Paid</option>
							<option value="Pending">Pending</option>
							<option value="proof-submitted">Submitted POP</option>
						</select>
						<input
							type="date"
							value={dateFromFilter}
							onChange={(e) => setDateFromFilter(e.target.value)}
							className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
							placeholder="From Date"
						/>
						<input type="date" value={dateToFilter} onChange={(e) => setDateToFilter(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" placeholder="To Date" />
						<Button onClick={handleResetFilters} variant="outline" className="whitespace-nowrap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
							Reset
						</Button>
					</div>
				</div>
			</div>

			{/* Table */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
				{pageLoading ? (
					<div className="flex justify-center items-center h-64">
						<div className="flex flex-col items-center gap-4">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
							<span className="text-gray-600 dark:text-gray-400">Loading transactions...</span>
						</div>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 dark:bg-gray-700">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">PH User</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">GH User</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date matched</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment proof</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
								</tr>
							</thead>
							<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
								{currentTransactions.map((transaction, index) => (
									<tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{startIndex + index + 1}</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{transaction.phUser}</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{transaction.ghUser}</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{transaction.amount}</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{transaction.dateMatched}</td>
										<td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(transaction.status)}</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{transaction.paymentProof ? (
												<Image src={transaction.paymentProof} alt="Payment proof" width={48} height={48} className="w-12 h-12 rounded object-cover cursor-pointer" onClick={() => window.open(transaction.paymentProof, '_blank')} />
											) : (
												<span className="text-gray-400 dark:text-gray-500 text-sm">No proof</span>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm">
											<div className="flex gap-2">
												<button onClick={() => setEditModal({ isOpen: true, transaction })} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors">
													<i className="ri-edit-line w-4 h-4 flex items-center justify-center"></i>
												</button>
												<button onClick={() => setDeleteModal({ isOpen: true, transaction })} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors">
													<i className="ri-delete-bin-line w-4 h-4 flex items-center justify-center"></i>
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{/* Empty State */}
			{filteredTransactions.length === 0 && !pageLoading && (
				<div className="text-center py-12">
					<i className="ri-exchange-line w-12 h-12 flex items-center justify-center mx-auto text-gray-400 mb-4"></i>
					<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No transactions found</h3>
					<p className="text-gray-500 dark:text-gray-400">{searchTerm ? `No transactions found matching "${searchTerm}"` : 'Try adjusting your search or filters'}</p>
				</div>
			)}

			{/* Pagination */}
			<div className="flex justify-center">
				<div className="flex gap-2">
					<button
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 1 || pageLoading}
						className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center"></i>
					</button>

					{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
						const pageNum = i + 1;
						return (
							<button
								key={pageNum}
								onClick={() => handlePageChange(pageNum)}
								disabled={pageLoading}
								className={`px-3 py-2 rounded-lg border ${
									currentPage === pageNum ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
								} disabled:opacity-50 disabled:cursor-not-allowed`}
							>
								{pageNum}
							</button>
						);
					})}

					{totalPages > 5 && (
						<>
							<span className="px-3 py-2 text-gray-500 dark:text-gray-400">...</span>
							<button
								onClick={() => handlePageChange(totalPages)}
								disabled={pageLoading}
								className={`px-3 py-2 rounded-lg border ${
									currentPage === totalPages ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
								} disabled:opacity-50 disabled:cursor-not-allowed`}
							>
								{totalPages}
							</button>
						</>
					)}

					<button
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages || pageLoading}
						className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<i className="ri-arrow-right-line w-4 h-4 flex items-center justify-center"></i>
					</button>
				</div>
			</div>

			{/* Edit Modal */}
			<TransactionModal isOpen={editModal.isOpen} onClose={() => setEditModal({ isOpen: false, transaction: null })} transaction={editModal.transaction} onSave={handleSaveTransaction} />

			{/* Add Modal */}
			<AddTransactionModal isOpen={addModal} onClose={() => setAddModal(false)} onAdd={handleAddTransaction} />

			{/* Delete Confirmation Modal */}
			<ConfirmationModal
				isOpen={deleteModal.isOpen}
				onClose={() => setDeleteModal({ isOpen: false, transaction: null })}
				onConfirm={handleDelete}
				title="Delete Transaction"
				message={`Are you sure you want to delete the transaction between ${deleteModal.transaction?.phUser} and ${deleteModal.transaction?.ghUser}?`}
				confirmText="Delete"
				confirmVariant="destructive"
				loading={deleteLoading}
			/>
		</div>
	);
}
