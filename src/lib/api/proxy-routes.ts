export const proxyApiRoutes = {
	activities: {
		getById: (activityId: string) => `/api/activities/${activityId}`
	},
	availabilityOptions: {
		byActivity: (activityId: string, fromDate?: string) => {
			const base = `/api/availability-options/by-activity/${activityId}`;
			return fromDate ? `${base}?fromDate=${fromDate}` : base;
		}
	},
	destinations: {
		activities: (destinationId: string, params?: URLSearchParams) => {
			const base = `/api/destinations/${destinationId}/activities`;
			return params?.size ? `${base}?${params}` : base;
		}
	},
	reviews: {
		byActivity: (activityId: string, params?: URLSearchParams) => {
			const base = `/api/reviews/${activityId}`;
			return params?.size ? `${base}?${params}` : base;
		}
	},
	newsletter: {
		subscribe: '/api/newsletter/subscribe'
	},
	orders: {
		create: '/api/orders',
		getById: (orderId: string) => `/api/orders/${orderId}`,
		addBooking: (orderId: string) => `/api/orders/${orderId}/bookings`
	},
	bookings: {
		delete: (bookingId: string) => `/api/bookings/${bookingId}`
	}
};
