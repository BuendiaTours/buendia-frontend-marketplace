import { apiClient } from '$core/_shared/client';
import { API_ENDPOINTS } from '$core/_shared/endpoints.config';
import type { AddBookingPayload, CartOrder, CreateOrderPayload } from '$lib/types';

export const ordersEndpoints = {
	async createOrder(fetchFn: typeof fetch, payload: CreateOrderPayload): Promise<void> {
		const path = API_ENDPOINTS.orders.create.path();
		await apiClient.request<void>(fetchFn, path, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
	},

	async getOrderById(fetchFn: typeof fetch, orderId: string): Promise<CartOrder> {
		const path = API_ENDPOINTS.orders.getById.path(orderId);
		const response = await apiClient.request<CartOrder>(fetchFn, path, { method: 'GET' });
		return response.data;
	},

	async addBookingToOrder(
		fetchFn: typeof fetch,
		orderId: string,
		payload: AddBookingPayload
	): Promise<void> {
		const path = API_ENDPOINTS.orders.addBooking.path(orderId);
		await apiClient.request<void>(fetchFn, path, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
	},

	async deleteBooking(fetchFn: typeof fetch, bookingId: string): Promise<void> {
		const path = API_ENDPOINTS.bookings.delete.path(bookingId);
		await apiClient.request<void>(fetchFn, path, { method: 'DELETE' });
	},

	async updateOrder(
		fetchFn: typeof fetch,
		orderId: string,
		data: Partial<CartOrder>
	): Promise<void> {
		const path = API_ENDPOINTS.orders.update.path(orderId);
		await apiClient.request<void>(fetchFn, path, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});
	}
};
