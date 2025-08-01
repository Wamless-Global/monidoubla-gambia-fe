import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
  title: 'Ph History',
  description: 'Ph History page.',
};

export default function Page() {
  return <Content />;
}
