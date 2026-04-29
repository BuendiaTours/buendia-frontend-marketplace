import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ordersEndpoints } from '$lib/api/endpoints/orders';
import { activityOptionsEndpoints } from '$lib/api/endpoints/activityOptions';
import { activitiesEndpoints } from '$lib/api/endpoints/activities';
import type { CartOrder } from '$lib/types';

export const GET: RequestHandler = async ({ params, fetch }) => {
	const [order, bookings] = await Promise.all([
		ordersEndpoints.getOrderById(fetch, params.orderId),
		ordersEndpoints.getBookingsByOrder(fetch, params.orderId)
	]);

	const activityIds = [...new Set(bookings.flatMap((b) => (b.activityId ? [b.activityId] : [])))];

	const [optionsByActivity, activities] = await Promise.all([
		Promise.allSettled(
			activityIds.map((id) => activityOptionsEndpoints.getByActivityId(fetch, id))
		),
		Promise.allSettled(activityIds.map((id) => activitiesEndpoints.getById(fetch, id)))
	]);

	const optionTitleMap = new Map(
		optionsByActivity
			.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
			.map((opt) => [opt.id, opt.title])
	);
	const activityTitleMap = new Map(
		activities
			.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []))
			.map((a) => [a.id, a.title])
	);
	const enrichedBookings = bookings.map((b) => ({
		...b,
		activityTitle: b.activityId ? activityTitleMap.get(b.activityId) : undefined,
		optionTitle: optionTitleMap.get(b.optionId)
	}));

	return json({ ...order, bookings: enrichedBookings });
};

export const PATCH: RequestHandler = async ({ params, request, fetch }) => {
	const data: Partial<CartOrder> = await request.json();
	await ordersEndpoints.updateOrder(fetch, params.orderId, data);
	return json(null, { status: 200 });
};
