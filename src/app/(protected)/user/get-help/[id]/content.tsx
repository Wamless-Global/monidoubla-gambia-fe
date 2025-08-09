import { Suspense } from 'react';
import GetHelpDetail from './GetHelpDetail';

interface PageProps {
	id: string;
}

export default function GetHelpDetailPage({ id }: PageProps) {
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center min-h-screen bg-gray-50">
					{/* Spinner color updated to teal to match the new design system */}
					<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
				</div>
			}
		>
			<GetHelpDetail phId={id} />
		</Suspense>
	);
}
