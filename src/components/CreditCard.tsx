'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrencySymbol } from '@/lib/helpers';

// NOTE: All original props and logic are preserved.
interface CreditCardType {
	title: string;
	amount: number;
	subtitle: string;
}

interface CreditCardProps {
	card: CreditCardType;
	icon: string;
	iconBgColor: string;
}

export function CreditCard({ card, icon, iconBgColor }: CreditCardProps) {
	return (
		<Card>
			<CardHeader className="flex-row items-center justify-between pb-2">
				<CardTitle className="text-sm font-medium text-gray-500">{card.title}</CardTitle>
				<div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBgColor}`}>
					<i className={`${icon} text-lg`}></i>
				</div>
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold text-gray-800">
					{getCurrencySymbol()}{' '}
					{card.amount.toLocaleString('en-US', {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					})}
				</div>
				<p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
			</CardContent>
		</Card>
	);
}
