import { Suspense } from 'react';
import GetHelpDetail from './GetHelpDetail';

interface PageProps {
	id: string;
}

export default function GetHelpDetailPage({ id }: PageProps) {
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center min-h-screen ">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
				</div>
			}
		>
			<GetHelpDetail phId={id} />
		</Suspense>
	);
}
