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
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
			<div className="max-w-md w-full text-center space-y-8">
				<div className="space-y-4">
					<div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto">
						<i className="ri-tools-line w-12 h-12 text-yellow-600 dark:text-yellow-500"></i>
					</div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white font-clash-display">Under Maintenance</h1>
					<p className="text-gray-600 dark:text-gray-400 font-montserrat">We're currently performing scheduled maintenance to improve your experience. We'll be back shortly.</p>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
					<div className="flex items-center justify-center gap-2 mb-4">
						<i className="ri-time-line w-5 h-5 text-gray-500 dark:text-gray-400"></i>
						<span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-poppins">Expected back online</span>
					</div>
					<div className="text-2xl font-bold text-blue-600 dark:text-blue-500 font-clash-display">{timeLeft}</div>
				</div>

				<div className="space-y-4">
					<Button onClick={() => window.location.reload()} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-poppins text-base flex items-center justify-center">
						<i className="ri-refresh-line w-4 h-4 mr-2"></i>
						Check Again
					</Button>

					<div className="flex items-center justify-center gap-4">
						<a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors">
							<i className="ri-twitter-fill w-5 h-5"></i>
						</a>
						<a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors">
							<i className="ri-facebook-fill w-5 h-5"></i>
						</a>
						<a href="mailto:support@Monidoublagambia.com" className="text-gray-400 hover:text-blue-500 transition-colors">
							<i className="ri-mail-fill w-5 h-5"></i>
						</a>
					</div>
				</div>

				<div className="text-sm text-gray-500 dark:text-gray-400 font-montserrat">
					<p>
						Follow us for updates or contact{' '}
						<a href="mailto:support@Monidoublagambia.com" className="text-blue-600 dark:text-blue-500 hover:underline">
							support
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}
