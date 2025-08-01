'use client';

import React, { useState } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export default function ForgotPasswordPageContent() {
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState('');
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	function validateEmail(email: string) {
		return /\S+@\S+\.\S+/.test(email);
	}

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError('');
		setSuccess('');
		if (!email) {
			setError('Email is required.');
			return;
		}
		if (!validateEmail(email)) {
			setError('Please enter a valid email address.');
			return;
		}
		setLoading(true);
		try {
			const response = await fetchWithAuth('/api/auth/request-password-reset', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email }),
			});
			const data = await response.json();
			if (response.ok) {
				setSuccess(data.message || 'Password reset link sent to your email.');
			} else {
				setError(data.message || 'Failed to send password reset link.');
			}
		} catch (err) {
			setError('An error occurred. Please try again.');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center px-2 py-10 sm:p-16">
			<div className="w-full">
				<div className="max-w-md w-full mx-auto">
					<div className="bg-white rounded-lg shadow-lg p-8">
						<div className="text-center mb-8">
							<h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password</h1>
							<p className="text-gray-600">Enter your email to receive a password reset link.</p>
						</div>
						<form onSubmit={onSubmit} className="space-y-6">
							<div>
								<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
									Email Address
								</label>
								<input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your email" required />
								{error && <p className="mt-1 text-sm text-red-500">{error}</p>}
								{success && <p className="mt-1 text-sm text-green-600">{success}</p>}
							</div>
							<button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium" disabled={loading}>
								{loading ? 'Sending...' : 'Send Reset Link'}
							</button>
						</form>
						<div className="mt-6 text-center">
							<p className="text-sm text-gray-600">
								Remember your password?{' '}
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
