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
		<section className="pt-32 pb-20 bg-gray-100">
			<div className="max-w-2xl mx-auto px-4">
				<div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-10">
					<h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Contact Us</h2>

					<form id="contact-form" onSubmit={handleSubmit} className="space-y-8">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-3">Full name</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
									<i className="ri-user-line text-gray-400 text-lg"></i>
								</div>
								<input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter your full name" className="w-full pl-12 pr-2 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base" required />
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-3">Email</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
									<i className="ri-mail-line text-gray-400 text-lg"></i>
								</div>
								<input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email address" className="w-full pl-12 pr-2 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base" required />
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-3">Message</label>
							<div className="relative">
								<div className="absolute top-4 left-4 pointer-events-none">
									<i className="ri-message-2-line text-gray-400 text-lg"></i>
								</div>
								<textarea
									name="message"
									value={formData.message}
									onChange={handleChange}
									placeholder="Enter your message"
									rows={8}
									maxLength={500}
									className="w-full pl-12 pr-2 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
									required
								/>
							</div>
							<p className="text-sm text-gray-500 mt-2 text-right">{formData.message.length}/500 characters</p>
						</div>

						<div className="pt-4">
							<Button type="submit" disabled={isSubmitting || formData.message.length > 500} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-medium whitespace-nowrap disabled:opacity-50 rounded-xl">
								{isSubmitting ? 'Sending...' : 'Send message'}
							</Button>
						</div>

						{submitStatus && <div className={`text-center p-4 rounded-xl ${submitStatus.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{submitStatus}</div>}
					</form>
				</div>
			</div>
		</section>
	);
}
