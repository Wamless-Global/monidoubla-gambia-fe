import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
  title: 'Multiple Match',
  description: 'Multiple Match page.',
};

export default function Page() {
  return <Content />;
}
