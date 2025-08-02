'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export default function ContactForm() {
	const [formData, setFormData] = useState({
		fullName: '',
		email: '',
		message: '',
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitStatus, setSubmitStatus] = useState('');

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setSubmitStatus('');

		try {
			const response = await fetchWithAuth('https://readdy.ai/api/form-submit', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					'form-id': 'contact-form',
					'full-name': formData.fullName,
					email: formData.email,
					message: formData.message,
				}),
			});

			if (response.ok) {
				setSubmitStatus('Message sent successfully! We will get back to you soon.');
				setFormData({ fullName: '', email: '', message: '' });
			} else {
				setSubmitStatus('Failed to send message. Please try again.');
			}
		} catch (error) {
			setSubmitStatus('Failed to send message. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section className="py-16 sm:py-24 bg-gray-100 dark:bg-gray-800">
			<div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 sm:p-8">
					<h2 className="text-3xl sm:text-4xl font-bold text-indigo-600 dark:text-indigo-400 font-clash-display text-center mb-8">Contact Us</h2>
					<form id="contact-form" onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 font-poppins mb-2">Full name</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<i className="ri-user-line text-indigo-600 dark:text-indigo-400 text-lg"></i>
								</div>
								<input
									type="text"
									name="fullName"
									value={formData.fullName}
									onChange={handleChange}
									placeholder="Enter your full name"
									className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm sm:text-base font-montserrat bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
									required
								/>
							</div>
						</div>
						<div>
							<label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 font-poppins mb-2">Email</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<i className="ri-mail-line text-indigo-600 dark:text-indigo-400 text-lg"></i>
								</div>
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									placeholder="Enter your email address"
									className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm sm:text-base font-montserrat bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
									required
								/>
							</div>
						</div>
						<div>
							<label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 font-poppins mb-2">Message</label>
							<div className="relative">
								<div className="absolute top-3 left-3 pointer-events-none">
									<i className="ri-message-2-line text-indigo-600 dark:text-indigo-400 text-lg"></i>
								</div>
								<textarea
									name="message"
									value={formData.message}
									onChange={handleChange}
									placeholder="Enter your message"
									rows={6}
									maxLength={500}
									className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent resize-none text-sm sm:text-base font-montserrat bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
									required
								/>
							</div>
							<p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-montserrat mt-2 text-right">{formData.message.length}/500 characters</p>
						</div>
						<div className="pt-2">
							<Button type="submit" disabled={isSubmitting || formData.message.length > 500} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-poppins text-base sm:text-lg py-3 rounded-full transition-all hover:scale-105 disabled:opacity-50">
								{isSubmitting ? 'Sending...' : 'Send message'}
							</Button>
						</div>
						{submitStatus && (
							<div className={`text-center p-4 rounded-xl ${submitStatus.includes('successfully') ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'} text-sm sm:text-base font-montserrat`}>
								{submitStatus}
							</div>
						)}
					</form>
				</div>
			</div>
		</section>
	);
}
