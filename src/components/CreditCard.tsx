'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrencySymbol } from '@/lib/helpers';

interface CreditCardType {
	title: string;
	amount: number;
	subtitle: string;
}

interface CreditCardProps {
	card: CreditCardType;
	variant?: 'default' | 'primary';
}

// Accent color palette for stats cards
const cardAccentStyles = [
	{
		bg: 'bg-gradient-to-br from-[#4F46E5] to-[#6366F1]',
		border: 'border-[#6366F1]',
		text: 'text-white',
		title: 'text-indigo-100',
		subtitle: 'text-indigo-200',
	},
	{
		bg: 'bg-gradient-to-br from-[#059669] to-[#10B981]',
		border: 'border-[#10B981]',
		text: 'text-white',
		title: 'text-emerald-100',
		subtitle: 'text-emerald-200',
	},
	{
		bg: 'bg-gradient-to-br from-[#F59E42] to-[#FBBF24]',
		border: 'border-[#FBBF24]',
		text: 'text-[#1F2A44]',
		title: 'text-yellow-900',
		subtitle: 'text-yellow-800',
	},
];

export function CreditCard({ card, variant = 'default', ...props }: CreditCardProps & { index?: number }) {
	// index prop is expected to be passed by parent for color cycling
	// fallback to default if not provided
	const index = (props as any).index ?? 0;
	const accent = cardAccentStyles[index % cardAccentStyles.length];
	return (
		<Card className={`slide-up ${accent.bg} ${accent.border} border shadow-lg`}>
			<CardHeader className="pb-2 px-6 pt-6">
				<CardTitle className={`font-poppins text-base font-semibold tracking-tight ${accent.title}`}>{card.title}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2 px-6 pb-6 pt-0">
				<div className={`text-2xl font-bold font-poppins ${accent.text}`}>
					{getCurrencySymbol()}{' '}
					{card.amount.toLocaleString('en-US', {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					})}
				</div>
				<p className={`text-xs font-inter ${accent.subtitle}`}>{card.subtitle}</p>
			</CardContent>
		</Card>
	);
}
