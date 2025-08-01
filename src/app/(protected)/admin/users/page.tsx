import { Metadata } from 'next';
import Content from './content';
import { cookies } from 'next/headers';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export const metadata: Metadata = {
	title: 'Users',
	description: 'Users page.',
};

export default async function Page() {
	const cookieStore = await cookies();
	const baseUrl = process.env.API_BASE_URL;

	let countries = [];

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
	return <Content countries={countries} />;
}
