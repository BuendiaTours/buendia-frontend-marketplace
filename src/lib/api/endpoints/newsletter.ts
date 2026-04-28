import { apiClient } from '$core/_shared/client';
import { API_ENDPOINTS } from '$core/_shared/endpoints.config';

export const newsletterEndpoints = {
	async subscribe(fetchFn: typeof fetch, email: string): Promise<void> {
		const path = API_ENDPOINTS.newsletter.subscribe.path();
		await apiClient.request(fetchFn, path, {
			method: 'POST',
			body: JSON.stringify({ email })
		});
	}
};
