import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
		<div className="modal fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60">
			<div className="modal-content slide-up max-w-lg w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-0">
				<div className="px-8 pt-8 pb-4 border-b border-gray-200 dark:border-gray-700">
					<h3 className="font-poppins text-xl font-semibold text-gray-900 dark:text-white mb-2">Provide Help Terms & Conditions</h3>
				</div>
				<div className="px-8 py-6 max-h-80 overflow-y-auto text-gray-700 dark:text-gray-300 text-sm">
					<p className="mb-3">By continuing, you agree to the following terms and conditions for providing help on this platform:</p>
					<ul className="list-disc pl-5 space-y-2">
						<li>You understand that providing help is voluntary and it involves your finance.</li>
						<li>You agree to follow all platform rules and act in good faith with other users.</li>
						<li>Violation of these terms may result in account suspension or removal.</li>
					</ul>
				</div>
				<div className="flex justify-end px-8 pb-8">
					<Button onClick={handleAgree} disabled={loading} className="button-primary w-full sm:w-auto font-inter text-base font-medium px-6 py-2">
						{loading ? 'Processing...' : 'I Agree & Continue'}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default TermsAndConditionsModal;
