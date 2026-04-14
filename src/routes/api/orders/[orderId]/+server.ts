import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ordersEndpoints } from '$lib/api/marketplace/endpoints/orders';
import type { CartOrder } from '$lib/types';

export const GET: RequestHandler = async ({ params, fetch }) => {
	const [order, bookings] = await Promise.all([
		ordersEndpoints.getOrderById(fetch, params.orderId),
		ordersEndpoints.getBookingsByOrder(fetch, params.orderId)
	]);
	return json({ ...order, bookings });
};

export const PATCH: RequestHandler = async ({ params, request, fetch }) => {
	const data: Partial<CartOrder> = await request.json();
	await ordersEndpoints.updateOrder(fetch, params.orderId, data);
	return json(null, { status: 200 });
};
