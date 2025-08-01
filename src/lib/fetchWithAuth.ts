import { getLoggedInAsUser, normalizeUrl, sanitizeUrl } from './helpers';

/**
 * Fetch utility that adds Authorization header if token is present.
 * Falls back to cookies if no token is provided.
 *
 * @param input - Request URL or Request object
 * @param init - Fetch options
 * @param token - Optional access token (if not provided, uses cookies only)
 */
export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}, token?: string | null) {
	const session = getLoggedInAsUser();

	const authToken = token;
	const headers = new Headers(init.headers || {});

	if (authToken || (session && session?.access_token)) {
		headers.set('Authorization', `Bearer ${authToken || session.access_token}`);
	}

	const cleanUrl = false;

	if (cleanUrl) {
		const cleanedInput = typeof input === 'string' ? input.replace(/^\/?api\/proxy\/?/i, '') : input;
		const formattedURL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/${cleanedInput}`;

		input = normalizeUrl(sanitizeUrl(formattedURL, process.env.NEXT_PUBLIC_API_BASE_URL!));
	}

	const method = init.method ? init.method.toUpperCase() : 'GET';
	return fetch(input, {
		...init,
		headers,
		method,
		credentials: 'include',
	});
}
