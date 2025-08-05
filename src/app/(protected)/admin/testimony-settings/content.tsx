'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';
import { handleFetchMessage } from '@/lib/helpers';

interface Testimony {
	id: string;
	user: string;
	content: string;
	video_url?: string | null;
	created_at: string;
	user_name?: string;
	approved?: boolean;
	avatar_url?: string | null;
}

export default function TestimonySettingsPage() {
	const [testimonies, setTestimonies] = useState<Testimony[]>([]);
	const [filteredTestimonies, setFilteredTestimonies] = useState<Testimony[]>([]);
	const [loading, setLoading] = useState(true);
	const [pageLoading, setPageLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [actionModal, setActionModal] = useState<{ isOpen: boolean; testimony: Testimony | null; action: 'publish' | 'unpublish' | null }>({
		isOpen: false,
		testimony: null,
		action: null,
	});
	const [actionLoading, setActionLoading] = useState(false);
	const itemsPerPage = 10;

	useEffect(() => {
		const loadTestimonies = async () => {
			setLoading(true);
			try {
				const res = await fetchWithAuth('/api/testimonies/all');
				if (!res.ok) throw new Error(handleFetchMessage(await res.json(), 'Failed to fetch testimonies'));
				const data = await res.json();
				logger.log(data);
				const txs: Testimony[] = (data.data || []).map((item: any) => ({
					id: item.id,
					user: item.user,
					content: item.content,
					video_url: item.video_url || null,
					created_at: item.created_at,
					user_name: item.user_name || '',
					approved: item.approved ?? false,
					avatar_url: item.avatar_url || null,
				}));
				setTestimonies(txs);
				setFilteredTestimonies(txs);
			} catch (error) {
				setTestimonies([]);
				setFilteredTestimonies([]);
				toast.error(handleFetchMessage(error, 'Failed to fetch testimonies'));
			} finally {
				setLoading(false);
			}
		};
		loadTestimonies();
	}, []);

	useEffect(() => {
		let filtered = testimonies;
		if (searchTerm) {
			filtered = filtered.filter((t) => (t.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (t.content || '').toLowerCase().includes(searchTerm.toLowerCase()));
		}
		if (statusFilter) {
			filtered = filtered.filter((t) => (statusFilter === 'published' ? t.approved : !t.approved));
		}
		setFilteredTestimonies(filtered);
		setCurrentPage(1);
	}, [searchTerm, statusFilter, testimonies]);

	const handlePageChange = async (page: number) => {
		setPageLoading(true);
		await new Promise((resolve) => setTimeout(resolve, 800));
		setCurrentPage(page);
		setPageLoading(false);
	};

	const handleResetFilters = () => {
		setSearchTerm('');
		setStatusFilter('');
		toast.success('Filters reset successfully');
	};

	const handleAction = async () => {
		if (!actionModal.testimony || !actionModal.action) return;
		setActionLoading(true);
		try {
			const formData = new FormData();
			formData.append('approved', actionModal.action === 'publish' ? 'true' : 'false');
			formData.append('id', actionModal.testimony.id);
			const res = await fetchWithAuth(`/api/testimonies/admin/${actionModal.testimony.id}`, {
				method: 'PUT',
				body: formData,
			});
			if (!res.ok) {
				const errMsg = handleFetchMessage(await res.json(), 'Failed to update testimony.');
				toast.error(errMsg);
			} else {
				setTestimonies((prev) => prev.map((t) => (t.id === actionModal.testimony!.id ? { ...t, approved: actionModal.action === 'publish' } : t)));
				setActionModal({ isOpen: false, testimony: null, action: null });
				toast.success(`Testimony ${actionModal.action === 'publish' ? 'published' : 'unpublished'} successfully`);
			}
		} catch (error) {
			toast.error(handleFetchMessage(error, 'Failed to update testimony'));
		} finally {
			setActionLoading(false);
		}
	};

	const totalPages = Math.ceil(filteredTestimonies.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const currentTestimonies = filteredTestimonies.slice(startIndex, startIndex + itemsPerPage);

	const getStatusBadge = (approved?: boolean) => {
		const statusStyles = approved ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
		return <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles}`}>{approved ? 'Published' : 'Unpublished'}</span>;
	};

	if (loading) {
		return (
			<div className="p-6 space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
					<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
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
										<div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-24"></div>
									</th>
									<th className="px-6 py-3 text-left">
										<div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-32"></div>
									</th>
									<th className="px-6 py-3 text-left">
										<div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-40"></div>
									</th>
									<th className="px-6 py-3 text-left">
										<div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-20"></div>
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
											<div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-32"></div>
										</td>
										<td className="px-6 py-4">
											<div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-40"></div>
										</td>
										<td className="px-6 py-4">
											<div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-20"></div>
										</td>
										<td className="px-6 py-4">
											<div className="h-6 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-16"></div>
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
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Testimonies</h1>
			</div>

			{/* Table */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
				{pageLoading ? (
					<div className="flex justify-center items-center h-64">
						<div className="flex flex-col items-center gap-4">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
							<span className="text-gray-600 dark:text-gray-400">Loading testimonies...</span>
						</div>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 dark:bg-gray-700">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Content</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Video</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
								</tr>
							</thead>
							<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
								{currentTestimonies.map((testimony, index) => (
									<tr key={testimony.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{startIndex + index + 1}</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
											<div className="flex items-center gap-2">
												{testimony.avatar_url ? (
													<img src={testimony.avatar_url} alt={testimony.user_name || testimony.user} className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
												) : (
													<span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-semibold text-sm">{(testimony.user_name || testimony.user || '').charAt(0).toUpperCase()}</span>
												)}
												<span>{testimony.user_name || testimony.user}</span>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white max-w-xs truncate" title={testimony.content}>
											{testimony.content}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm">
											{testimony.video_url ? (
												<a href={testimony.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
													View Video
												</a>
											) : (
												<span className="text-gray-400 dark:text-gray-500 text-sm">No video</span>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{new Date(testimony.created_at).toLocaleDateString('en-GB')}</td>
										<td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(testimony.approved)}</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm">
											<div className="flex gap-2">
												{testimony.approved ? (
													<button onClick={() => setActionModal({ isOpen: true, testimony, action: 'unpublish' })} className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900 rounded-lg transition-colors">
														<i className="ri-eye-off-line w-4 h-4 flex items-center justify-center"></i>
													</button>
												) : (
													<button onClick={() => setActionModal({ isOpen: true, testimony, action: 'publish' })} className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors">
														<i className="ri-eye-line w-4 h-4 flex items-center justify-center"></i>
													</button>
												)}
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
			{filteredTestimonies.length === 0 && !pageLoading && (
				<div className="text-center py-12">
					<i className="ri-exchange-line w-12 h-12 flex items-center justify-center mx-auto text-gray-400 mb-4"></i>
					<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No testimonies found</h3>
					<p className="text-gray-500 dark:text-gray-400">{searchTerm ? `No testimonies found matching "${searchTerm}"` : 'Try adjusting your search or filters'}</p>
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

			{/* Publish/Unpublish Confirmation Modal */}
			<ConfirmationModal
				isOpen={actionModal.isOpen}
				onClose={() => setActionModal({ isOpen: false, testimony: null, action: null })}
				onConfirm={handleAction}
				title={actionModal.action === 'publish' ? 'Publish Testimony' : 'Unpublish Testimony'}
				message={
					actionModal.action === 'publish' ? `Are you sure you want to publish this testimony by ${actionModal.testimony?.user_name || actionModal.testimony?.user}?` : `Are you sure you want to unpublish this testimony by ${actionModal.testimony?.user_name || actionModal.testimony?.user}?`
				}
				confirmText={actionModal.action === 'publish' ? 'Publish' : 'Unpublish'}
				confirmVariant={actionModal.action === 'publish' ? 'default' : 'destructive'}
				loading={actionLoading}
			/>
		</div>
	);
}
