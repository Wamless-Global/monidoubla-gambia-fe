import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
  title: 'Add Product',
  description: 'Add Product page.',
};

export default function Page() {
  return <Content />;
}
