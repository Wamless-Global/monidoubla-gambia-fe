import { Suspense } from 'react';
import GetHelpDetail from './GetHelpDetail';

interface PageProps {
	id: string;
}

export default function GetHelpDetailPage({ id }: PageProps) {
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white/80 to-blue-50/40 dark:from-blue-900/30 dark:to-blue-950/10">
					<div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 shadow-xl bg-white/60"></div>
				</div>
			}
		>
			<GetHelpDetail phId={id} />
		</Suspense>
	);
}
