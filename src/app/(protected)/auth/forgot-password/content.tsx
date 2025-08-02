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
		<div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4 sm:p-8">
			<div className="container flex flex-col lg:flex-row gap-8">
				<div className="lg:w-1/3 bg-neutral-dark text-white p-8 rounded-lg shadow-xl flex flex-col justify-center">
					<h1 className="text-3xl font-bold mb-4">Reset Your Password</h1>
					<p className="text-neutral-light">Enter your email to receive a secure link to reset your password.</p>
				</div>
				<div className="lg:w-2/3 card">
					<div className="text-center mb-8">
						<h2 className="text-2xl font-bold">Forgot Password</h2>
						<p className="text-text-secondary">Enter your email to receive a password reset link.</p>
					</div>
					<form onSubmit={onSubmit} className="space-y-6">
						<div>
							<label htmlFor="email" className="label">
								Email Address
							</label>
							<input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="Enter your email" required />
							{error && <p className="mt-1 text-sm text-red-500">{error}</p>}
							{success && <p className="mt-1 text-sm text-green-600">{success}</p>}
						</div>
						<button type="submit" className="button button-primary w-full" disabled={loading}>
							{loading ? 'Sending...' : 'Send Reset Link'}
						</button>
					</form>
					<div className="mt-6 text-center">
						<p className="text-sm text-text-secondary">
							Remember your password?{' '}
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
