import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getCurrentUser, setCurrentUser } from '@/lib/userUtils';
import { toast } from 'sonner';

import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { handleFetchMessage } from '@/lib/helpers';

interface TermsModalProps {
	isOpen: boolean;
	onAgree: () => void;
}

const TermsAndConditionsModal: React.FC<TermsModalProps> = ({ isOpen, onAgree }) => {
	const [loading, setLoading] = useState(false);

	if (!isOpen) return null;

	const handleAgree = async () => {
		setLoading(true);
		try {
			const user = getCurrentUser();
			if (!user) throw new Error('User not found');

			// Prepare form data for update
			const formData = new FormData();
			formData.append('agreed_to_ph_terms', 'true');

			const res = await fetchWithAuth('/api/users/profile', {
				method: 'PUT',
				body: formData,
			});
			const updatedUser = await res.json();
			if (res.ok) {
				setCurrentUser({ ...updatedUser.data });
				toast.success('You have agreed to the Provide Help Terms and Conditions.');
				onAgree();
			} else {
				const errorMessage = handleFetchMessage(updatedUser, 'Failed to update agreement.');
				throw new Error(errorMessage);
			}
		} catch (err) {
			const errorMessage = handleFetchMessage(err, 'An error occurred while updating agreement.');
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 !mt-0">
			<Card className="max-w-lg w-full p-6 bg-white dark:bg-gray-800 border-0 shadow-lg">
				<CardContent className="p-0">
					<h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Provide Help Terms & Conditions</h2>
					<div className="mb-6 text-gray-700 dark:text-gray-300 text-sm max-h-60 overflow-y-auto">
						<p className="mb-2">By continuing, you agree to the following terms and conditions for providing help on this platform:</p>
						<ul className="list-disc pl-5 space-y-2">
							<li>You understand that providing help is voluntary and it involves your finance.</li>
							<li>You agree to follow all platform rules and act in good faith with other users.</li>
							{/* <li>You will not hold the platform responsible for any loss or delay in matching or payment.</li>
							<li>You agree to provide accurate information and proof of payment when required.</li> */}
							<li>Violation of these terms may result in account suspension or removal.</li>
						</ul>
					</div>
					<div className="flex justify-end gap-2">
						<Button onClick={handleAgree} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
							{loading ? 'Processing...' : 'I Agree & Continue'}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default TermsAndConditionsModal;
