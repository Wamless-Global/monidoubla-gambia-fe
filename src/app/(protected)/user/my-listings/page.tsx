import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
  title: 'My Listings',
  description: 'My Listings page.',
};

export default function Page() {
  return <Content />;
}
