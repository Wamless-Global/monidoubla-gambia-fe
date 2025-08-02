import { Suspense } from 'react';
import GetHelpDetail from './GetHelpDetail';

interface PageProps {
	id: string;
}

export default function GetHelpDetailPage({ id }: PageProps) {
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
				</div>
			}
		>
			<GetHelpDetail phId={id} />
		</Suspense>
	);
}
