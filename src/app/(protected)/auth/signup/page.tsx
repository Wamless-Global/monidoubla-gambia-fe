import { Metadata } from 'next';
import Content from './content';
import { cookies } from 'next/headers';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export const metadata: Metadata = {
	title: 'Sign Up',
	description: 'Create a new account to start using our services.',
	keywords: ['sign up', 'register', 'create account', 'new user'],
};

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
	const params = await searchParams;
	const referralId = params?.ref;
	const cookieStore = await cookies();
	const baseUrl = process.env.API_BASE_URL;

	let referralData = null;
	let countries = [];

	if (referralId) {
		const url = `${baseUrl}/auth/referral/${encodeURIComponent(referralId)}`;
		try {
			const res = await fetchWithAuth(url, {
				headers: {
					Cookie: cookieStore.toString(),
				},
				cache: 'no-store',
			});
			if (res.ok) {
				referralData = await res.json();
			}
		} catch (e) {}
	}
	const data = { ...referralData };
	if (referralData) data.data.referral_id = referralId;

	try {
		const countriesRes = await fetchWithAuth(`${baseUrl}/auth/all-countries`, {
			headers: {
				Cookie: cookieStore.toString(),
			},
			cache: 'no-store',
		});
		if (countriesRes.ok) {
			countries = await countriesRes.json();
		}
	} catch (e) {}

	return <Content referralData={data} countries={countries} />;
}
