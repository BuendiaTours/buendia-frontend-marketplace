import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ordersEndpoints } from '$lib/api/endpoints/orders';

export const DELETE: RequestHandler = async ({ params, fetch }) => {
	await ordersEndpoints.deleteBooking(fetch, params.bookingId);
	return json(null, { status: 200 });
};

export const PATCH: RequestHandler = async ({ params, request, fetch }) => {
	const body = await request.json();
	await ordersEndpoints.patchBooking(fetch, params.bookingId, body);
	return json(null, { status: 200 });
};
