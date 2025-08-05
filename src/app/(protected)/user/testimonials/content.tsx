'use client';

import { useState, useEffect, useCallback } from 'react';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { getCurrentUser } from '@/lib/userUtils';
import { handleFetchMessage } from '@/lib/helpers';
import { logger } from '@/lib/logger';

interface Testimony {
	id: string;
	user: string;
	content: string;
	video_url?: string | null;
	created_at: string;
	approved: boolean;
	user_name?: string;
	avatar_url?: string;
}

export default function UserTestimonialsPage() {
	const [testimonies, setTestimonies] = useState<Testimony[]>([]);
	const [content, setContent] = useState<string>('');
	const [video, setVideo] = useState<File | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [pageLoading, setPageLoading] = useState<boolean>(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editContent, setEditContent] = useState<string>('');
	const [editVideo, setEditVideo] = useState<File | null>(null);
	const [videoPreview, setVideoPreview] = useState<string | null>(null);
	const [editVideoPreview, setEditVideoPreview] = useState<string | null>(null);
	const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
	const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
	const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

	const testimoniesPerPage = 10;

	const fetchTestimonies = useCallback(async (page = 1) => {
		if (page > 1) setPageLoading(true);
		else setIsLoading(true);
		try {
			const user = getCurrentUser();
			if (!user) throw new Error('User not found');
			const params = new URLSearchParams();
			params.append('userId', user.id);
			params.append('page', page.toString());
			params.append('pageSize', testimoniesPerPage.toString());
			const res = await fetchWithAuth(`/api/testimonies?${params.toString()}`);
			if (!res.ok) throw new Error(handleFetchMessage(await res.json(), 'Failed to fetch testimonies'));

			const data = await res.json();
			setTestimonies(data.data || []);
			setTotalCount(data.total || data.data?.length || 0);
			logger.log('Total Count:', data.count, 'Total Pages:', Math.ceil((data.count || data.data?.length || 0) / testimoniesPerPage));
		} catch (e) {
			toast.error(handleFetchMessage(e, 'Failed to load testimonies'));
			setTestimonies([]);
			setTotalCount(0);
		} finally {
			setIsLoading(false);
			setPageLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchTestimonies(1);
		return () => {
			if (videoPreview) URL.revokeObjectURL(videoPreview);
			if (editVideoPreview) URL.revokeObjectURL(editVideoPreview);
		};
	}, [fetchTestimonies]);

	const handlePageChange = (page: number) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
			fetchTestimonies(page);
		}
	};

	const handleUpload = async () => {
		if (!content && !video) {
			toast.error('Please enter a testimony or upload a video.');
			return;
		}
		try {
			const user = getCurrentUser();
			if (!user) throw new Error('User not found');
			const formData = new FormData();
			formData.append('content', content);
			if (video) formData.append('video', video);
			formData.append('user', user.id);
			const res = await fetchWithAuth('/api/testimonies', {
				method: 'POST',
				body: formData,
			});
			if (!res.ok) throw new Error(handleFetchMessage(await res.json(), 'Failed to upload testimony'));
			toast.success('Testimony uploaded successfully');
			setContent('');
			setVideo(null);
			if (videoPreview) {
				URL.revokeObjectURL(videoPreview);
				setVideoPreview(null);
			}
			fetchTestimonies(1); // Reset to page 1 after upload
		} catch (e) {
			toast.error(handleFetchMessage(e, 'Failed to upload testimony'));
		}
	};

	const handleDelete = (id: string) => {
		setDeleteTargetId(id);
		setDeleteModalOpen(true);
	};

	const confirmDelete = async () => {
		if (!deleteTargetId) return;
		setDeleteLoading(true);
		try {
			const res = await fetchWithAuth(`/api/testimonies/${deleteTargetId}`, { method: 'DELETE' });
			if (!res.ok) throw new Error(handleFetchMessage(await res.json(), 'Failed to delete testimony'));
			toast.success('Testimony deleted');
			fetchTestimonies(currentPage); // Stay on current page, or go to previous if needed
			if (testimonies.length === 1 && currentPage > 1) {
				setCurrentPage(currentPage - 1);
				fetchTestimonies(currentPage - 1);
			}
		} catch (e) {
			toast.error(handleFetchMessage(e, 'Failed to delete testimony'));
		} finally {
			setDeleteLoading(false);
			setDeleteModalOpen(false);
			setDeleteTargetId(null);
		}
	};

	const handleEdit = (testimony: Testimony) => {
		setEditingId(testimony.id);
		setEditContent(testimony.content);
		setEditVideo(null);
		if (editVideoPreview) {
			URL.revokeObjectURL(editVideoPreview);
		}
		setEditVideoPreview(testimony.video_url ?? null);
	};

	const handleEditSave = async (id: string) => {
		try {
			const formData = new FormData();
			formData.append('content', editContent);
			formData.append('id', id);
			if (editVideo) formData.append('video', editVideo);
			const res = await fetchWithAuth(`/api/testimonies/${id}`, {
				method: 'PUT',
				body: formData,
			});
			if (!res.ok) throw new Error(handleFetchMessage(await res.json(), 'Failed to update testimony'));
			toast.success('Testimony updated');
			setEditingId(null);
			setEditContent('');
			setEditVideo(null);
			if (editVideoPreview) {
				URL.revokeObjectURL(editVideoPreview);
				setEditVideoPreview(null);
			}
			fetchTestimonies(currentPage);
		} catch (e) {
			toast.error(handleFetchMessage(e, 'Failed to update testimony'));
		}
	};

	const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
		const file = e.target.files?.[0] || null;
		logger.log('Selected file:', file);
		if (isEdit) {
			if (editVideoPreview) {
				URL.revokeObjectURL(editVideoPreview);
			}
			setEditVideo(file);
			setEditVideoPreview(file ? URL.createObjectURL(file) : null);
		} else {
			if (videoPreview) {
				URL.revokeObjectURL(videoPreview);
			}
			setVideo(file);
			if (videoPreview) {
				setVideoPreview(null);
				setTimeout(() => {
					setVideoPreview(file ? URL.createObjectURL(file) : null);
				}, 10);
			} else {
				setVideoPreview(file ? URL.createObjectURL(file) : null);
			}
		}
		if (e.target) {
			e.target.value = '';
		}
	};

	const totalPages = Math.ceil(totalCount / testimoniesPerPage);

	const generatePageNumbers = () => {
		const pages: (number | string)[] = [];
		const showPages = 5;

		if (totalPages <= showPages) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			if (currentPage <= 3) {
				for (let i = 1; i <= 4; i++) {
					pages.push(i);
				}
				pages.push('...');
				pages.push(totalPages - 1);
				pages.push(totalPages);
			} else if (currentPage >= totalPages - 2) {
				pages.push(1);
				pages.push(2);
				pages.push('...');
				for (let i = totalPages - 3; i <= totalPages; i++) {
					pages.push(i);
				}
			} else {
				pages.push(1);
				pages.push('...');
				for (let i = currentPage - 1; i <= currentPage + 1; i++) {
					pages.push(i);
				}
				pages.push('...');
				pages.push(totalPages);
			}
		}

		return pages;
	};

	return (
		<>
			<ConfirmationModal
				isOpen={deleteModalOpen}
				onClose={() => {
					setDeleteModalOpen(false);
					setDeleteTargetId(null);
				}}
				onConfirm={confirmDelete}
				title="Delete Testimony"
				message="Are you sure you want to delete this testimony? This action cannot be undone."
				confirmText="Delete"
				confirmVariant="destructive"
				loading={deleteLoading}
			/>
			<div className="p-4 lg:p-6 min-h-screen">
				<div className="max-w-3xl mx-auto">
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">My Testimonials</h2>
					<Card className="mb-8 p-6 bg-white dark:bg-gray-800 border-0">
						<CardContent className="p-0">
							<h3 className="font-semibold text-gray-900 dark:text-white mb-2">Share Your Testimony</h3>
							<textarea
								value={content}
								onChange={(e) => setContent(e.target.value)}
								placeholder="Write your testimony..."
								rows={3}
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
							/>
							<input type="file" accept="video/*" onChange={(e) => handleVideoChange(e, false)} className="mb-2" />
							{videoPreview && (
								<video controls className="w-full max-w-md mb-2 rounded">
									<source src={videoPreview} type="video/mp4" />
									Your browser does not support the video tag.
								</video>
							)}
							<Button onClick={handleUpload} className="bg-blue-600 hover:bg-blue-700 text-white">
								Upload
							</Button>
						</CardContent>
					</Card>
					<div className="space-y-6">
						{isLoading ? (
							<div className="flex items-center justify-center py-10">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
							</div>
						) : testimonies.length === 0 ? (
							<div className="text-center text-gray-500 dark:text-gray-400">No testimonies yet.</div>
						) : (
							testimonies.map((testimony) => (
								<Card key={testimony.id} className="p-4 bg-white dark:bg-gray-800 border-0">
									<CardContent className="p-0">
										{editingId === testimony.id ? (
											<>
												<textarea
													value={editContent}
													onChange={(e) => setEditContent(e.target.value)}
													rows={3}
													className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
												/>
												<input type="file" accept="video/*" onChange={(e) => handleVideoChange(e, true)} className="mb-2" />
												{editVideoPreview && (
													<video controls className="w-full max-w-md mb-2 rounded">
														<source src={editVideoPreview} type="video/mp4" />
														Your browser does not support the video tag.
													</video>
												)}
												<div className="flex gap-2">
													<Button onClick={() => handleEditSave(testimony.id)} className="bg-green-600 hover:bg-green-700 text-white">
														Save
													</Button>
													<Button
														onClick={() => {
															setEditingId(null);
															if (editVideoPreview && editVideoPreview !== testimony.video_url) {
																URL.revokeObjectURL(editVideoPreview);
																setEditVideoPreview(null);
															}
														}}
														variant="outline"
													>
														Cancel
													</Button>
												</div>
											</>
										) : (
											<>
												<div className="flex items-center mb-2 gap-2">
													{testimony.avatar_url && <img src={testimony.avatar_url} alt={testimony.user_name || 'User'} className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700" />}
													<span className="text-gray-900 dark:text-white whitespace-pre-line break-words overflow-auto" style={{ maxHeight: '12rem', wordBreak: 'break-word' }}>
														{testimony.content}
													</span>
													<span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${testimony.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`} title={testimony.approved ? 'Published' : 'Unpublished Approval'}>
														{testimony.approved ? 'Published' : 'Unpublished'}
													</span>
												</div>
												{testimony.video_url && (
													<video controls className="w-full max-w-md mb-2 rounded">
														<source src={testimony.video_url} type="video/mp4" />
														Your browser does not support the video tag.
													</video>
												)}
												<div className="flex gap-2">
													<Button onClick={() => handleEdit(testimony)} variant="outline">
														Edit
													</Button>
													<Button onClick={() => handleDelete(testimony.id)} variant="outline" className="text-red-600 border-red-600">
														Delete
													</Button>
												</div>
											</>
										)}
									</CardContent>
								</Card>
							))
						)}
					</div>
					{pageLoading && (
						<div className="flex items-center justify-center py-10">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
						</div>
					)}
					{totalPages > 1 && !pageLoading && (
						<div className="flex justify-center items-center gap-2 mt-6">
							<button
								onClick={() => handlePageChange(currentPage - 1)}
								disabled={currentPage === 1}
								className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
							>
								<i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center"></i>
							</button>
							{generatePageNumbers().map((page, index) => (
								<button
									key={index}
									onClick={() => typeof page === 'number' && handlePageChange(page)}
									disabled={page === '...' || page === currentPage}
									className={`px-3 py-2 rounded-lg border cursor-pointer ${page === currentPage ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'} ${
										page === '...' ? 'cursor-default' : ''
									}`}
								>
									{page}
								</button>
							))}
							<button
								onClick={() => handlePageChange(currentPage + 1)}
								disabled={currentPage === totalPages}
								className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
							>
								<i className="ri-arrow-right-line w-4 h-4 flex items-center justify-center"></i>
							</button>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
