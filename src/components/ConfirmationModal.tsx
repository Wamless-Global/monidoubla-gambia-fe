'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

// NOTE: All original props and logic are preserved.
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
}

export function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', confirmVariant = 'default', loading = false }: ConfirmationModalProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in-0 !m-0">
			<Card className="max-w-md w-full bg-white shadow-lg border-slate-200 animate-in fade-in-0 zoom-in-95">
				<CardHeader>
					<CardTitle>{title}</CardTitle>
					<CardDescription>{message}</CardDescription>
				</CardHeader>
				<CardFooter className="bg-slate-50 p-4 flex justify-end gap-3">
					<Button variant="outline" onClick={onClose} disabled={loading}>
						{cancelText}
					</Button>
					<Button onClick={onConfirm} variant={confirmVariant} disabled={loading} className="min-w-[120px]">
						{loading ? (
							<div className="flex items-center justify-center gap-2">
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
								<span>Processing...</span>
							</div>
						) : (
							confirmText
						)}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
