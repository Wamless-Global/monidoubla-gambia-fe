import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactHero from './ContactHero';
import ContactForm from './ContactForm';
import Map from './Map';
import ContactInfo from './ContactInfo';

export const metadata: Metadata = {
	title: 'Contact Us',
	description: 'Contact us for any inquiries or support.',
};

export default function ContactPage() {
	return (
		<div className="min-h-screen">
			<Header />
			<ContactHero />
			<ContactForm />
			<Map />
			<Footer />
		</div>
	);
}
