import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { getCurrentUser, setCurrentUser } from '@/lib/userUtils';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { handleFetchMessage } from '@/lib/helpers';

// NOTE: All original props and logic are preserved.
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
			const res = await fetchWithAuth('/api/users/profile', { method: 'PUT', body: formData });
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

	// ===============================================
	// START: Redesigned JSX
	// ===============================================
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in-0 !mt-0">
			<Card className="max-w-lg w-full bg-white shadow-lg border-gray-200 animate-in fade-in-0 zoom-in-95">
				<CardHeader>
					<CardTitle className="text-lg font-semibold text-gray-800">Provide Help Terms & Conditions</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-sm text-gray-600 max-h-60 overflow-y-auto pr-2 space-y-4">
						<p>By continuing, you acknowledge and agree to the following terms for providing help on this platform:</p>
						<ul className="list-disc pl-5 space-y-2 text-gray-700">
							<li>You understand that providing help is a voluntary action involving your personal finances.</li>
							<li>You agree to follow all platform rules and to act in good faith when interacting with other users.</li>
							<li>You agree that any violation of these terms may result in the suspension or termination of your account.</li>
						</ul>
					</div>
				</CardContent>
				<CardFooter className="bg-gray-50 p-4">
					<Button onClick={handleAgree} disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 text-white">
						{loading ? 'Processing...' : 'I Agree & Continue'}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
};

export default TermsAndConditionsModal;
