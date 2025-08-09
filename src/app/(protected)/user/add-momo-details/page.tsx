import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
	title: 'Add Momo Details',
	description: 'Add Momo Details page.',
};

export default function Page() {
	return <Content />;
}
