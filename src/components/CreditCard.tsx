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

export function CreditCard({ card, variant = 'default' }: CreditCardProps) {
	return (
		<Card className={`${variant === 'primary' ? 'bg-blue-900 text-white border-blue-800' : 'bg-white'}`}>
			<CardHeader className="pb-3 p-4 lg:p-6">
				<CardTitle className={`text-sm font-medium ${variant === 'primary' ? 'text-blue-200' : 'text-gray-600'}`}>{card.title}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2 p-4 lg:p-6 pt-0">
				<div className={`text-xl lg:text-2xl font-bold ${variant === 'primary' ? 'text-white' : 'text-gray-900'}`}>
					{getCurrencySymbol()}{' '}
					{card.amount.toLocaleString('en-US', {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					})}
				</div>
				<p className={`text-xs lg:text-sm ${variant === 'primary' ? 'text-blue-100' : 'text-gray-500'}`}>{card.subtitle}</p>
			</CardContent>
		</Card>
	);
}
