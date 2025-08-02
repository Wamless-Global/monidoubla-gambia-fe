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
			<div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4 sm:p-8">
				<div className="container">
					<div className="card max-w-md mx-auto">
						<div className="text-center">
							<h2 className="text-2xl font-bold mb-8">Update Password</h2>
							<div className="flex items-center justify-center gap-2">
								<Loader2 className="h-5 w-5 animate-spin text-primary" />
								<h3 className="text-lg">Loading...</h3>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4 sm:p-8">
			<div className="container flex flex-col lg:flex-row gap-8">
				<div className="lg:w-1/3 bg-neutral-dark text-white p-8 rounded-lg shadow-xl flex flex-col justify-center">
					<h1 className="text-3xl font-bold mb-4">Update Your Password</h1>
					<p className="text-neutral-light">Set a new password to secure your Monidoublagambia account.</p>
				</div>
				<div className="lg:w-2/3 card">
					<div className="text-center mb-8">
						<h2 className="text-2xl font-bold">{title}</h2>
						<p className="text-text-secondary">{statusMessage}</p>
					</div>
					<form onSubmit={onSubmit} className="space-y-6">
						<div>
							<label htmlFor="newPassword" className="label">
								New Password
							</label>
							<input type="password" id="newPassword" name="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input" placeholder="Enter new password" required />
						</div>
						<div>
							<label htmlFor="confirmPassword" className="label">
								Confirm Password
							</label>
							<input type="password" id="confirmPassword" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input" placeholder="Confirm new password" required />
						</div>
						{error && <p className="mt-1 text-sm text-red-500">{error}</p>}
						{success && <p className="mt-1 text-sm text-green-600">{success}</p>}
						<button type="submit" className="button button-primary w-full" disabled={loading}>
							{loading ? 'Updating...' : 'Update Password'}
						</button>
					</form>
					<div className="mt-6 text-center">
						<p className="text-sm text-text-secondary">
							Back to{' '}
							<a href="/auth/login" className="text-primary hover:text-secondary font-medium">
								Sign in
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
