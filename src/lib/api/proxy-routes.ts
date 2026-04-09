export const proxyApiRoutes = {
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
	}
};
