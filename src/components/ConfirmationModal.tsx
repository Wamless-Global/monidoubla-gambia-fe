'use client';

import { Button } from '@/components/ui/button';

interface ConfirmationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	confirmVariant?: 'default' | 'destructive';
	loading?: boolean;
	actionText?: string;
}

export function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', confirmVariant = 'default', loading = false }: ConfirmationModalProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 !m-0">
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
				<div className="p-6">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
					<p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
					<div className="flex justify-end gap-3">
						<Button onClick={onClose} variant="outline" disabled={loading} className="whitespace-nowrap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
							{cancelText}
						</Button>
						<Button onClick={onConfirm} variant={confirmVariant} disabled={loading} className={`whitespace-nowrap min-w-[100px] ${confirmVariant === 'destructive' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
							{loading ? (
								<div className="flex items-center gap-2">
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
									<span>Processing...</span>
								</div>
							) : (
								confirmText
							)}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
