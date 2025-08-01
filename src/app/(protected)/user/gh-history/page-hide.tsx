import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
	title: 'Gh History',
	description: 'Gh History page.',
};

export default function Page() {
	return <Content />;
}
