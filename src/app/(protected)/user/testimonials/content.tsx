'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ConfirmationModal } from '@/components/ConfirmationModal'; // Restored import
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { getCurrentUser } from '@/lib/userUtils';
import { handleFetchMessage } from '@/lib/helpers';
import { logger } from '@/lib/logger';

// NOTE: All original interfaces and logic are preserved.
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
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	const addVideoInputRef = useRef<HTMLInputElement>(null);
	const editVideoInputRef = useRef<HTMLInputElement>(null);

	const testimoniesPerPage = 5;

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
		setIsSubmitting(true);
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
			fetchTestimonies(1);
			setCurrentPage(1);
		} catch (e) {
			toast.error(handleFetchMessage(e, 'Failed to upload testimony'));
		} finally {
			setIsSubmitting(false);
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
			if (testimonies.length === 1 && currentPage > 1) {
				const newPage = currentPage - 1;
				setCurrentPage(newPage);
				fetchTestimonies(newPage);
			} else {
				fetchTestimonies(currentPage);
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
		setIsSubmitting(true);
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
			fetchTestimonies(currentPage);
		} catch (e) {
			toast.error(handleFetchMessage(e, 'Failed to update testimony'));
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
		const file = e.target.files?.[0] || null;
		if (file) {
			if (file.size > 20 * 1024 * 1024) {
				// 20MB limit
				toast.error('Video file size should not exceed 20MB.');
				return;
			}
			if (!file.type.startsWith('video/')) {
				toast.error('Please select a valid video file.');
				return;
			}
		}

		if (isEdit) {
			if (editVideoPreview) URL.revokeObjectURL(editVideoPreview);
			setEditVideo(file);
			setEditVideoPreview(file ? URL.createObjectURL(file) : null);
		} else {
			if (videoPreview) URL.revokeObjectURL(videoPreview);
			setVideo(file);
			setVideoPreview(file ? URL.createObjectURL(file) : null);
		}
		if (e.target) e.target.value = '';
	};

	const totalPages = Math.ceil(totalCount / testimoniesPerPage);

	return (
		<>
			{/* Using the redesigned, shared ConfirmationModal component */}
			<ConfirmationModal
				isOpen={deleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				onConfirm={confirmDelete}
				title="Delete Testimony"
				message="Are you sure you want to delete this testimony? This action cannot be undone."
				confirmText="Delete"
				confirmVariant="destructive"
				loading={deleteLoading}
			/>
			<div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
				<div className="max-w-4xl mx-auto">
					<header className="mb-8">
						<h1 className="text-3xl font-bold text-gray-800">My Testimonials</h1>
						<p className="text-gray-500 mt-1">Share your experience with the community and manage your past submissions.</p>
					</header>

					<Card className="mb-8">
						<CardHeader>
							<CardTitle>Share Your Experience</CardTitle>
							<CardDescription>Your story can inspire others. Write a few words or upload a short video.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="What's your story?" rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition" />
							<input type="file" accept="video/*" ref={addVideoInputRef} onChange={(e) => handleVideoChange(e, false)} className="hidden" />
							{videoPreview && (
								<div className="border rounded-lg p-2 bg-gray-50">
									<video key={videoPreview} controls className="w-full max-h-60 rounded">
										<source src={videoPreview} />
										Your browser does not support the video tag.
									</video>
									<p className="text-xs text-gray-500 mt-2 text-center">{video?.name}</p>
								</div>
							)}
						</CardContent>
						<CardFooter className="flex justify-between items-center">
							<Button variant="outline" onClick={() => addVideoInputRef.current?.click()}>
								<i className="ri-vidicon-line mr-2"></i>
								{video ? 'Change Video' : 'Upload Video'}
							</Button>
							<Button onClick={handleUpload} disabled={isSubmitting}>
								{isSubmitting ? 'Submitting...' : 'Submit Testimony'}
							</Button>
						</CardFooter>
					</Card>

					<div className="space-y-6">
						{isLoading ? (
							<div className="flex justify-center py-10">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
							</div>
						) : testimonies.length === 0 ? (
							<Card className="p-12 text-center">
								<i className="ri-quill-pen-line text-5xl text-gray-400 mx-auto mb-4"></i>
								<h3 className="text-xl font-semibold text-gray-700">No Testimonies Yet</h3>
								<p className="text-gray-500 mt-2">You haven't shared any testimonies. Be the first to share your story!</p>
							</Card>
						) : (
							testimonies.map((testimony) => (
								<Card key={testimony.id} className="overflow-hidden">
									{editingId === testimony.id ? (
										<div className="bg-gray-50 p-6">
											<textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition mb-4" />
											<input type="file" accept="video/*" ref={editVideoInputRef} onChange={(e) => handleVideoChange(e, true)} className="hidden" />
											{editVideoPreview && (
												<div className="border rounded-lg p-2 bg-white mb-4">
													<video key={editVideoPreview} controls className="w-full max-h-48 rounded">
														<source src={editVideoPreview} />
													</video>
												</div>
											)}
											<div className="flex justify-between">
												<Button variant="outline" onClick={() => editVideoInputRef.current?.click()}>
													<i className="ri-vidicon-line mr-2"></i>
													{editVideo ? 'Change Video' : 'Upload New Video'}
												</Button>
												<div className="flex gap-2">
													<Button variant="outline" onClick={() => setEditingId(null)}>
														Cancel
													</Button>
													<Button onClick={() => handleEditSave(testimony.id)} disabled={isSubmitting}>
														{isSubmitting ? 'Saving...' : 'Save Changes'}
													</Button>
												</div>
											</div>
										</div>
									) : (
										<>
											<CardHeader className="flex-row justify-between items-start">
												<div className="flex items-center gap-4">
													{testimony.avatar_url && <img src={testimony.avatar_url} alt={testimony.user_name || 'User'} className="w-10 h-10 rounded-full object-cover" />}
													<div>
														<p className="font-semibold text-gray-800">{testimony.user_name || 'Anonymous'}</p>
														<p className="text-xs text-gray-500">{new Date(testimony.created_at).toLocaleDateString()}</p>
													</div>
												</div>
												<Badge variant={testimony.approved ? 'success' : 'warning'}>{testimony.approved ? 'Published' : 'Pending'}</Badge>
											</CardHeader>
											<CardContent className="space-y-4">
												<p className="text-gray-700 whitespace-pre-line">{testimony.content}</p>
												{testimony.video_url && (
													<div className="border rounded-lg p-2">
														<video controls className="w-full max-h-80 rounded">
															<source src={testimony.video_url} />
														</video>
													</div>
												)}
											</CardContent>
											<CardFooter className="flex justify-end gap-2">
												<Button variant="outline" onClick={() => handleEdit(testimony)}>
													Edit
												</Button>
												<Button variant="destructive" onClick={() => handleDelete(testimony.id)}>
													Delete
												</Button>
											</CardFooter>
										</>
									)}
								</Card>
							))
						)}
					</div>

					{pageLoading && (
						<div className="flex justify-center py-10">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
						</div>
					)}

					{totalPages > 1 && !pageLoading && (
						<div className="flex justify-center items-center gap-2 mt-8 text-sm">
							<Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
								<i className="ri-arrow-left-s-line"></i>
							</Button>
							<span className="text-gray-700 font-medium">
								Page {currentPage} of {totalPages}
							</span>
							<Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
								<i className="ri-arrow-right-s-line"></i>
							</Button>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
