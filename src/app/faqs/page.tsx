import { Metadata } from 'next';
import Header from '@/components/Header';
import FAQItem from './FAQItem';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
	title: 'FAQs',
	description: 'Frequently Asked Questions about Monidoublagambia',
};

export default function FAQsPage() {
	const faqs = [
		{
			question: 'What is Monidoublagambia?',
			answer: 'Monidoublagambia is a peer-to-peer financial empowerment platform that helps individuals grow their money through a structured tier-based system. Our mission is to provide financial freedom through team-based value creation and collaborative donation opportunities.',
		},
		{
			question: 'How does the tier system work?',
			answer: 'Our tier system allows you to start with a minimum donation of 5 LRD and grow through different levels. Each tier offers different benefits and earning potentials. As you progress through tiers, you unlock higher earning opportunities and referral bonuses.',
		},
		{
			question: 'What is the minimum donation required?',
			answer: 'The minimum donation to get started with Monidoublagambia is 5 LRD. This allows you to enter the first tier and begin your journey toward financial growth through our structured system.',
		},
		{
			question: 'How do referrals work?',
			answer: 'When you refer someone to Monidoublagambia, you earn commissions based on their donation and activity. The referral system is designed to reward active participants who help grow our community. Higher tiers unlock better referral commission rates.',
		},
		{
			question: 'Is Monidoublagambia safe and secure?',
			answer: 'Yes, Monidoublagambia prioritizes the security and safety of all user donations. We use advanced security measures and follow strict financial protocols to protect your funds and personal information.',
		},
		{
			question: 'How can I withdraw my earnings?',
			answer: 'Withdrawals can be made through our secure platform once you meet the minimum withdrawal requirements. The process is straightforward and typically processed within 24-48 hours during business days.',
		},
		{
			question: 'What support is available for new users?',
			answer: 'We provide comprehensive support for all new users including onboarding assistance, educational resources, and ongoing customer support. Our team is available to help you navigate the platform and maximize your earning potential.',
		},
		{
			question: 'Can I upgrade my tier anytime?',
			answer: 'Yes, you can upgrade your tier at any time by making additional donations. Upgrading to higher tiers unlocks better earning opportunities, higher referral commissions, and additional platform benefits.',
		},
	];

	return (
		<div className="min-h-screen bg-gray-100 dark:bg-gray-800 pt-16">
			<Header />
			<section className="py-16 sm:py-24">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-8 sm:mb-12">
						<h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-indigo-600 dark:text-indigo-400 font-clash-display">FAQs</h1>
						<p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-montserrat mt-4 max-w-2xl mx-auto">Find answers to commonly asked questions about Monidoublagambia, our platform, and how to get started on your financial growth journey.</p>
					</div>
					<div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 sm:p-8">
						<div className="grid grid-cols-1 gap-4 sm:gap-6">
							{faqs.map((faq, index) => (
								<FAQItem key={index} question={faq.question} answer={faq.answer} />
							))}
						</div>
					</div>
				</div>
			</section>
			<Footer />
		</div>
	);
}
