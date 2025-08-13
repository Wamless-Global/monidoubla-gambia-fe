import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest) {
	// Clear the session cookies by setting them to empty and expired
	const response = NextResponse.json({ status: 'success', message: 'Session cleared.' });
	response.cookies.set('sb-access-token', '', {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		path: '/',
		maxAge: 0,
		sameSite: 'lax',
	});
	response.cookies.set('sb-refresh-token', '', {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		path: '/',
		maxAge: 0,
		sameSite: 'lax',
	});
	return response;
}
