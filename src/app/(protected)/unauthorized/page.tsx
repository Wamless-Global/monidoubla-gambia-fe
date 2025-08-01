import UnauthorizedPageContent from './content';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Unauthorized',
	description: 'You do not have permission to access this page.',
};

export default function Page() {
	return (
		<>
			<UnauthorizedPageContent />
		</>
	);
}
