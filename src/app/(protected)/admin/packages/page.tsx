import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
  title: 'Packages',
  description: 'Packages page.',
};

export default function Page() {
  return <Content />;
}
