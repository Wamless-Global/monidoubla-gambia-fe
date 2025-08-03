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
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-200/60 via-white/70 to-blue-400/30 dark:from-blue-900/60 dark:via-blue-950/40 dark:to-blue-950/10 backdrop-blur-[6px]">
			<Card className="max-w-lg w-full p-0 border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-white/80 to-blue-50/60 dark:from-blue-900/40 dark:to-blue-950/10">
				<CardContent className="p-0">
					<div className="px-8 pt-8 pb-6">
						<h2 className="text-2xl font-extrabold mb-4 text-blue-900 dark:text-white tracking-tight">Provide Help Terms &amp; Conditions</h2>
						<div className="mb-8 text-blue-900/80 dark:text-blue-100 text-base max-h-60 overflow-y-auto rounded-xl bg-white/40 dark:bg-blue-900/20 p-4 shadow-inner">
							<p className="mb-3">By continuing, you agree to the following terms and conditions for providing help on this platform:</p>
							<ul className="list-disc pl-6 space-y-3">
								<li>You understand that providing help is voluntary and it involves your finance.</li>
								<li>You agree to follow all platform rules and act in good faith with other users.</li>
								{/* <li>You will not hold the platform responsible for any loss or delay in matching or payment.</li>
							   <li>You agree to provide accurate information and proof of payment when required.</li> */}
								<li>Violation of these terms may result in account suspension or removal.</li>
							</ul>
						</div>
						<div className="flex justify-end gap-2 mt-2">
							<Button onClick={handleAgree} disabled={loading} className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white py-3 px-6 rounded-xl shadow-lg text-lg font-semibold min-w-[180px]">
								{loading ? 'Processing...' : 'I Agree & Continue'}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default TermsAndConditionsModal;
