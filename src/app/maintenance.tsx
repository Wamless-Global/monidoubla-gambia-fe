'use client';

import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export default function MaintenanceMode() {
	const [timeLeft, setTimeLeft] = useState('');

	useEffect(() => {
		const targetDate = new Date();
		targetDate.setHours(targetDate.getHours() + 2);

		const timer = setInterval(() => {
			const now = new Date().getTime();
			const distance = targetDate.getTime() - now;

			if (distance < 0) {
				setTimeLeft('Soon');
				return;
			}

			const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

			setTimeLeft(`${hours}h ${minutes}m`);
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	return (
		<div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
			<div className="max-w-md w-full text-center space-y-8">
				<div>
					<div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<i className="ri-tools-line text-3xl text-amber-600"></i>
					</div>
					<h1 className="text-3xl font-bold text-slate-800">Under Maintenance</h1>
					<p className="text-slate-500 mt-2">We're performing scheduled maintenance to improve our platform. We'll be back online shortly.</p>
				</div>

				<div className="bg-white rounded-lg p-6 shadow-sm border">
					<div className="flex items-center justify-center gap-2 mb-2">
						<i className="ri-time-line text-slate-500"></i>
						<span className="text-sm font-medium text-slate-700">Expected back in</span>
					</div>
					<div className="text-3xl font-bold text-indigo-600">{timeLeft || '...'}</div>
				</div>

				<div className="space-y-3">
					<Button onClick={() => window.location.reload()} className="w-full">
						<i className="ri-refresh-line mr-2"></i>
						Check Again
					</Button>
				</div>

				<div className="text-sm text-slate-500">
					<p>
						Follow us on social media for updates or{' '}
						<a href="mailto:support@example.com" className="font-medium text-indigo-600 hover:underline">
							contact support
						</a>
						.
					</p>
				</div>
			</div>
		</div>
	);
}
