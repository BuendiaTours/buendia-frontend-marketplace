import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { newsletterEndpoints } from '$lib/api/marketplace/endpoints/newsletter';

export const POST: RequestHandler = async ({ request, fetch }) => {
	const { email } = await request.json();
	await newsletterEndpoints.subscribe(fetch, email);
	return json({ ok: true });
};
