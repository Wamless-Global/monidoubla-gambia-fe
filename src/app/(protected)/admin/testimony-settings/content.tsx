'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';
import { handleFetchMessage } from '@/lib/helpers';

// NOTE: All original interfaces and logic are preserved.
interface Testimony {
	id: string;
	user: string;
	content: string;
	video_url?: string | null;
	created_at: string;
	user_name?: string;
	approved: boolean;
	avatar_url?: string | null;
}

export default function TestimonySettingsPage() {
	const [testimonies, setTestimonies] = useState<Testimony[]>([]);
	const [loading, setLoading] = useState(true);
	const [pageLoading, setPageLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [actionModal, setActionModal] = useState<{ isOpen: boolean; testimony: Testimony | null; action: 'publish' | 'unpublish' | null }>({ isOpen: false, testimony: null, action: null });
	const [actionLoading, setActionLoading] = useState(false);

	const itemsPerPage = 10;

	useEffect(() => {
		const loadTestimonies = async () => {
			setLoading(true);
			try {
				const res = await fetchWithAuth('/api/testimonies/all');
				if (!res.ok) throw new Error(handleFetchMessage(await res.json(), 'Failed to fetch testimonies'));
				const data = await res.json();
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
			} catch (error) {
				toast.error(handleFetchMessage(error, 'Failed to fetch testimonies'));
			} finally {
				setLoading(false);
			}
		};
		loadTestimonies();
	}, []);

	const filteredTestimonies = useMemo(() => {
		return testimonies.filter((t) => {
			const matchesSearch = (t.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (t.content || '').toLowerCase().includes(searchTerm.toLowerCase());
			const matchesStatus = !statusFilter || (statusFilter === 'published' ? t.approved : !t.approved);
			return matchesSearch && matchesStatus;
		});
	}, [searchTerm, statusFilter, testimonies]);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};
	const handleResetFilters = () => {
		setSearchTerm('');
		setStatusFilter('');
	};

	const handleAction = async () => {
		if (!actionModal.testimony || !actionModal.action) return;
		setActionLoading(true);
		try {
			const formData = new FormData();
			formData.append('approved', actionModal.action === 'publish' ? 'true' : 'false');
			formData.append('id', actionModal.testimony.id);
			const res = await fetchWithAuth(`/api/testimonies/admin/${actionModal.testimony.id}`, { method: 'PUT', body: formData });
			if (!res.ok) throw new Error(handleFetchMessage(await res.json(), 'Failed to update testimony.'));

			setTestimonies((prev) => prev.map((t) => (t.id === actionModal.testimony!.id ? { ...t, approved: actionModal.action === 'publish' } : t)));
			setActionModal({ isOpen: false, testimony: null, action: null });
			toast.success(`Testimony ${actionModal.action === 'publish' ? 'published' : 'unpublished'} successfully`);
		} catch (error) {
			toast.error(handleFetchMessage(error, 'Failed to update testimony'));
		} finally {
			setActionLoading(false);
		}
	};

	const totalPages = Math.ceil(filteredTestimonies.length / itemsPerPage);
	const currentTestimonies = filteredTestimonies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

	return (
		<div className="space-y-6">
			<header>
				<h1 className="text-3xl font-bold text-slate-800">Testimony Management</h1>
				<p className="text-slate-500 mt-1">Review, publish, and unpublish user testimonials.</p>
			</header>

			<Card>
				<CardHeader>
					<div className="flex flex-col md:flex-row gap-4">
						<div className="relative flex-1">
							<i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
							<input type="text" placeholder="Search by user or content..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10" />
						</div>
						<div className="flex gap-3">
							<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full sm:w-auto">
								<option value="">All Statuses</option>
								<option value="published">Published</option>
								<option value="unpublished">Unpublished</option>
							</select>
							<Button variant="outline" onClick={handleResetFilters}>
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
									<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">User</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Content</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Video</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-slate-200">
								{loading ? (
									<tr>
										<td colSpan={6} className="text-center py-20 text-slate-500">
											Loading...
										</td>
									</tr>
								) : currentTestimonies.length === 0 ? (
									<tr>
										<td colSpan={6} className="text-center py-20 text-slate-500">
											No testimonies found.
										</td>
									</tr>
								) : (
									currentTestimonies.map((testimony) => (
										<tr key={testimony.id}>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center gap-3">
													<img src={testimony.avatar_url || `https://ui-avatars.com/api/?name=${(testimony.user_name || 'A').replace(' ', '+')}`} alt={testimony.user_name || 'User'} className="w-10 h-10 rounded-full object-cover" />
													<span className="font-medium text-slate-800">{testimony.user_name || 'Anonymous'}</span>
												</div>
											</td>
											<td className="px-6 py-4">
												<p className="text-sm text-slate-600 max-w-xs truncate" title={testimony.content}>
													{testimony.content}
												</p>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												{testimony.video_url ? (
													<a href={testimony.video_url} target="_blank" rel="noopener noreferrer">
														<Button variant="outline" size="sm">
															View Video
														</Button>
													</a>
												) : (
													<span className="text-xs text-slate-400">N/A</span>
												)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(testimony.created_at).toLocaleDateString()}</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<Badge variant={testimony.approved ? 'success' : 'warning'}>{testimony.approved ? 'Published' : 'Unpublished'}</Badge>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-right">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon">
															<i className="ri-more-2-fill"></i>
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														{testimony.approved ? (
															<DropdownMenuItem onClick={() => setActionModal({ isOpen: true, testimony, action: 'unpublish' })} className="text-amber-600">
																Unpublish
															</DropdownMenuItem>
														) : (
															<DropdownMenuItem onClick={() => setActionModal({ isOpen: true, testimony, action: 'publish' })} className="text-green-600">
																Publish
															</DropdownMenuItem>
														)}
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
							Page {currentPage} of {totalPages}
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

			<ConfirmationModal
				isOpen={actionModal.isOpen}
				onClose={() => setActionModal({ isOpen: false, testimony: null, action: null })}
				onConfirm={handleAction}
				title={actionModal.action === 'publish' ? 'Publish Testimony' : 'Unpublish Testimony'}
				message={`Are you sure you want to ${actionModal.action} this testimony?`}
				confirmText={actionModal.action === 'publish' ? 'Publish' : 'Unpublish'}
				confirmVariant={actionModal.action === 'publish' ? 'default' : 'destructive'}
				loading={actionLoading}
			/>
		</div>
	);
}
