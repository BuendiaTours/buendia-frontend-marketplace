import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ordersEndpoints } from '$lib/api/marketplace/endpoints/orders';

export const DELETE: RequestHandler = async ({ params, fetch }) => {
	await ordersEndpoints.deleteBooking(fetch, params.bookingId);
	return json(null, { status: 200 });
};
