import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
  title: 'Approve Uploads',
  description: 'Approve Uploads page.',
};

export default function Page() {
  return <Content />;
}
