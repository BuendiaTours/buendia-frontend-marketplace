import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ordersEndpoints } from '$lib/api/marketplace/endpoints/orders';
import type { CreateOrderPayload } from '$lib/types';

export const POST: RequestHandler = async ({ request, fetch }) => {
	const payload: CreateOrderPayload = await request.json();
	await ordersEndpoints.createOrder(fetch, payload);
	return json(null, { status: 200 });
};
