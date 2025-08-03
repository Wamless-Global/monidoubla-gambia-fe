import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
	title: 'Testimony Settings',
	description: 'Testimony Settings',
};

export default function Page() {
	return <Content />;
}
