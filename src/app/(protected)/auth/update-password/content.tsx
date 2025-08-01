'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { VerifyResetTokenResult } from '@/types';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { Loader2 } from 'lucide-react';

export default function UpdatePasswordPageContent() {
	const router = useRouter();

	const [loading, setLoading] = useState(false);
	const [token, setToken] = useState<string | null>(null);
	const [pageStatus, setPageStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
	const [statusMessage, setStatusMessage] = useState('Checking password reset link...');
	const [title, setTitle] = useState('Update Password');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	useEffect(() => {
		const hash = window.location.hash;
		const params = new URLSearchParams(hash.substring(1));
		const error = params.get('error');
		const errorCode = params.get('error_code');
		const errorDesc = params.get('error_description');
		const tokenFromUrl = params.get('access_token');

		async function verifyToken(token: string) {
			try {
				const res = await fetchWithAuth(
					`/api/auth/verify-reset-token`,
					{
						method: 'POST',
						body: JSON.stringify({ accessToken: token }),
					},
					token
				);

				const result: VerifyResetTokenResult = await res.json();
				if (result.valid) {
					setToken(token);
					setPageStatus('success');
					setStatusMessage('Please enter your new password.');
					setTitle('Update Password');
					toast.success('Your password reset link is valid. Please enter your new password.');
				} else {
					const message = result.error?.message || 'Password reset link is invalid or expired.';
					setStatusMessage(message);
					toast.error(message);
					setPageStatus(result.error?.name === 'TokenExpiredError' ? 'expired' : 'error');
					setTitle(result.error?.name === 'TokenExpiredError' ? 'Link Expired' : 'Invalid Link');
				}
			} catch {
				setStatusMessage('Failed to verify reset link.');
				setPageStatus('error');
				setTitle('Error');
			}
		}

		if (error) {
			const detailedMessage = errorDesc || 'An unknown error occurred.';
			setStatusMessage(detailedMessage);
			toast.error(detailedMessage);
			if (errorCode === 'otp_expired' || error === 'access_denied') {
				setPageStatus('expired');
				setTitle('Link Expired');
			} else {
				setPageStatus('error');
				setTitle('Error');
			}
		} else if (tokenFromUrl) {
			verifyToken(tokenFromUrl);
		} else {
			const message = 'Password reset link is invalid or missing.';
			setStatusMessage(message);
			toast.error(message);
			setPageStatus('error');
			setTitle('Invalid Link');
		}
	}, []);

	function validateForm() {
		if (!newPassword || !confirmPassword) {
			setError('Both password fields are required.');
			return false;
		}
		if (newPassword.length < 6) {
			setError('Password must be at least 6 characters.');
			return false;
		}
		if (newPassword !== confirmPassword) {
			setError('Passwords do not match.');
			return false;
		}
		setError('');
		return true;
	}

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError('');
		setSuccess('');
		if (!validateForm()) return;
		if (!token) {
			setError('Password reset token is missing.');
			return;
		}
		setLoading(true);
		try {
			const response = await fetchWithAuth(
				'/api/auth/update-password',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						accessToken: token,
						newPassword,
						confirmPassword,
					}),
				},
				token
			);
			const data = await response.json();

			if (response.ok) {
				setSuccess(data.message || 'Your password has been updated successfully. Please login.');
				setTimeout(() => {
					router.push('/auth/login');
				}, 5000);
				setNewPassword('');
				setConfirmPassword('');
			} else {
				setError(data.message || 'Failed to update password.');
			}
		} catch (err) {
			setError('An error occurred. Please try again.');
		} finally {
			setLoading(false);
		}
	}

	if (pageStatus === 'loading') {
		return (
			<div className="min-h-screen bg-gray-100 flex items-center justify-center">
				<div className="max-w-md w-full mx-auto px-4 py-12">
					<div className="bg-white rounded-lg shadow-lg p-10">
						<div className="text-center">
							<h1 className="text-2xl font-bold text-gray-900  mb-8">Update Password</h1>

							<div className="flex items-center justify-center gap-2">
								<Loader2 className="h-5 w-5 animate-spin" />
								<h2 className="text-lg">Loading...</h2>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center px-2 py-10 sm:p-16">
			<div className="w-full">
				<div className="max-w-md w-full mx-auto">
					<div className="bg-white rounded-lg shadow-lg p-8">
						<div className="text-center mb-8">
							<h1 className="text-2xl font-bold text-gray-900 mb-2">Update Password</h1>
							<p className="text-gray-600">Enter your new password below.</p>
						</div>
						<form onSubmit={onSubmit} className="space-y-6">
							<div>
								<label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
									New Password
								</label>
								<input
									type="password"
									id="newPassword"
									name="newPassword"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Enter new password"
									required
								/>
							</div>
							<div>
								<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
									Confirm Password
								</label>
								<input
									type="password"
									id="confirmPassword"
									name="confirmPassword"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Confirm new password"
									required
								/>
							</div>
							{error && <p className="mt-1 text-sm text-red-500">{error}</p>}
							{success && <p className="mt-1 text-sm text-green-600">{success}</p>}
							<button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium" disabled={loading}>
								{loading ? 'Updating...' : 'Update Password'}
							</button>
						</form>
						<div className="mt-6 text-center">
							<p className="text-sm text-gray-600">
								Back to{' '}
								<a href="/auth/login" className="text-blue-600 hover:text-blue-500 font-medium">
									Sign in
								</a>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
