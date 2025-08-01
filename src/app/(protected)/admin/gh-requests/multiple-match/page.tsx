import { Metadata } from 'next';
import Content from '../../ph-requests/multiple-match/content';

export const metadata: Metadata = {
	title: 'Match Multiple Users',
	description: '',
};

export default function Page() {
	return (
		<>
			<Content to="gh-requests" />
		</>
	);
}
