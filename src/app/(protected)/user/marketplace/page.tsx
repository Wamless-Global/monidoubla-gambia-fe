import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
  title: 'Marketplace',
  description: 'Marketplace page.',
};

export default function Page() {
  return <Content />;
}
