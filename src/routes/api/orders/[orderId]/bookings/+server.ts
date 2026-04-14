import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ordersEndpoints } from '$lib/api/marketplace/endpoints/orders';
import type { AddBookingPayload } from '$lib/types';

export const POST: RequestHandler = async ({ params, request, fetch }) => {
	const payload: AddBookingPayload = await request.json();
	await ordersEndpoints.addBookingToOrder(fetch, params.orderId, payload);
	return json(null, { status: 200 });
};
