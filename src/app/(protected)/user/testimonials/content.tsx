'use client';

import { useState, useEffect } from 'react';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { getCurrentUser } from '@/lib/userUtils';

interface Testimony {
	id: string;
	userId: string;
	content: string;
	video_url?: string;
	createdAt: string;
}

export default function UserTestimonialsPage() {
	const [testimonies, setTestimonies] = useState<Testimony[]>([]);
	const [content, setContent] = useState('');
	const [video, setVideo] = useState<File | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editContent, setEditContent] = useState('');
	const [editVideo, setEditVideo] = useState<File | null>(null);
	const [videoPreview, setVideoPreview] = useState<string | null>(null);
	const [editVideoPreview, setEditVideoPreview] = useState<string | null>(null);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
	const [deleteLoading, setDeleteLoading] = useState(false);

	useEffect(() => {
		fetchTestimonies();
		// Cleanup object URLs on component unmount
		return () => {
			if (videoPreview) URL.revokeObjectURL(videoPreview);
			if (editVideoPreview) URL.revokeObjectURL(editVideoPreview);
		};
	}, []);

	const fetchTestimonies = async () => {
		setIsLoading(true);
		try {
			const user = getCurrentUser();
			if (!user) throw new Error('User not found');
			const res = await fetchWithAuth(`/api/testimonies?userId=${user.id}`);
			const data = await res.json();
			setTestimonies(data.data || []);
		} catch (e) {
			toast.error('Failed to load testimonies');
		} finally {
			setIsLoading(false);
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
			if (!res.ok) throw new Error('Failed to upload testimony');
			toast.success('Testimony uploaded successfully');
			setContent('');
			setVideo(null);
			if (videoPreview) {
				URL.revokeObjectURL(videoPreview); // Revoke previous URL
				setVideoPreview(null);
			}
			fetchTestimonies();
		} catch (e) {
			toast.error('Failed to upload testimony');
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
			if (!res.ok) throw new Error();
			toast.success('Testimony deleted');
			fetchTestimonies();
		} catch {
			toast.error('Failed to delete testimony');
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
			URL.revokeObjectURL(editVideoPreview); // Revoke previous URL
			setEditVideoPreview(null);
		}
	};

	const handleEditSave = async (id: string) => {
		try {
			const formData = new FormData();
			formData.append('content', editContent);
			if (editVideo) formData.append('video', editVideo);
			const res = await fetchWithAuth(`/api/testimonies/${id}`, {
				method: 'PUT',
				body: formData,
			});
			if (!res.ok) throw new Error();
			toast.success('Testimony updated');
			setEditingId(null);
			setEditContent('');
			setEditVideo(null);
			if (editVideoPreview) {
				URL.revokeObjectURL(editVideoPreview); // Revoke previous URL
				setEditVideoPreview(null);
			}
			fetchTestimonies();
		} catch {
			toast.error('Failed to update testimony');
		}
	};

	const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
		const file = e.target.files?.[0] || null;
		if (isEdit) {
			setEditVideo(file);
			if (editVideoPreview) {
				URL.revokeObjectURL(editVideoPreview); // Revoke previous URL
			}
			setEditVideoPreview(file ? URL.createObjectURL(file) : null);
		} else {
			setVideo(file);
			if (videoPreview) {
				URL.revokeObjectURL(videoPreview); // Revoke previous URL
			}
			setVideoPreview(file ? URL.createObjectURL(file) : null);
		}
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
					<h2 className="text-3xl font-extrabold text-foreground tracking-tight mb-6">My Testimonials</h2>
					<Card className="mb-10 border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-white/80 to-blue-50/40 dark:from-blue-900/30 dark:to-blue-950/10">
						<CardContent className="p-8">
							<h3 className="font-semibold text-lg text-foreground mb-3">Share Your Testimony</h3>
							<textarea
								value={content}
								onChange={(e) => setContent(e.target.value)}
								placeholder="Write your testimony..."
								rows={3}
								className="w-full px-4 py-3 border-0 rounded-xl shadow bg-gradient-to-r from-white/80 to-blue-50/40 dark:from-blue-900/20 dark:to-blue-950/5 text-base focus:ring-2 focus:ring-blue-400 focus:outline-none mb-3"
							/>
							<input type="file" accept="video/*" onChange={(e) => handleVideoChange(e, false)} className="mb-3" />
							{videoPreview && (
								<video controls className="w-full max-w-md mb-3 rounded-xl shadow">
									<source src={videoPreview} type="video/mp4" />
									Your browser does not support the video tag.
								</video>
							)}
							<Button onClick={handleUpload} className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white py-3 rounded-xl shadow-lg text-lg font-semibold">
								Upload
							</Button>
						</CardContent>
					</Card>
					<div className="space-y-8">
						{isLoading ? (
							<div className="text-center text-muted-foreground text-lg">Loading...</div>
						) : testimonies.length === 0 ? (
							<div className="text-center text-muted-foreground text-lg">No testimonies yet.</div>
						) : (
							testimonies.map((testimony) => (
								<Card key={testimony.id} className="border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-white/80 to-green-50/40 dark:from-green-900/30 dark:to-green-950/10">
									<CardContent className="p-8">
										{editingId === testimony.id ? (
											<>
												<textarea
													value={editContent}
													onChange={(e) => setEditContent(e.target.value)}
													rows={3}
													className="w-full px-4 py-3 border-0 rounded-xl shadow bg-gradient-to-r from-white/80 to-green-50/40 dark:from-green-900/20 dark:to-green-950/5 text-base focus:ring-2 focus:ring-green-400 focus:outline-none mb-3"
												/>
												<input type="file" accept="video/*" onChange={(e) => handleVideoChange(e, true)} className="mb-3" />
												{editVideoPreview && (
													<video controls className="w-full max-w-md mb-3 rounded-xl shadow">
														<source src={editVideoPreview} type="video/mp4" />
														Your browser does not support the video tag.
													</video>
												)}
												<div className="flex gap-3">
													<Button onClick={() => handleEditSave(testimony.id)} className="bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 text-white py-3 rounded-xl shadow-lg text-lg font-semibold">
														Save
													</Button>
													<Button
														onClick={() => {
															setEditingId(null);
															if (editVideoPreview) {
																URL.revokeObjectURL(editVideoPreview);
																setEditVideoPreview(null);
															}
														}}
														variant="outline"
														className="py-3 rounded-xl text-lg font-semibold"
													>
														Cancel
													</Button>
												</div>
											</>
										) : (
											<>
												<div className="mb-3 text-foreground whitespace-pre-line break-words overflow-auto text-lg" style={{ maxHeight: '12rem', wordBreak: 'break-word' }}>
													{testimony.content}
												</div>
												{testimony.video_url && (
													<video controls className="w-full max-w-md mb-3 rounded-xl shadow">
														<source src={testimony.video_url} type="video/mp4" />
														Your browser does not support the video tag.
													</video>
												)}
												<div className="flex gap-3">
													<Button onClick={() => handleEdit(testimony)} variant="outline" className="py-3 rounded-xl text-lg font-semibold">
														Edit
													</Button>
													<Button onClick={() => handleDelete(testimony.id)} variant="outline" className="py-3 rounded-xl text-lg font-semibold text-red-600 border-red-600">
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
				</div>
			</div>
		</>
	);
}
