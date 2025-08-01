import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactForm from './ContactForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Contact Us',
	description: 'Contact us for any inquiries or support.',
};

export default function ContactPage() {
	return (
		<div className="min-h-screen">
			<Header />
			<ContactForm />
			<Footer />
		</div>
	);
}
