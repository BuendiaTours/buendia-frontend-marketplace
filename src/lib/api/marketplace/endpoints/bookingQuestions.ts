import { bookingsApiClient as apiClient } from '$core/_shared/client';
import { API_ENDPOINTS } from '$core/_shared/endpoints.config';
import type { BookingQuestion } from '$lib/types';

export const bookingQuestionsEndpoints = {
	async byActivityOption(fetchFn: typeof fetch, optionId: string): Promise<BookingQuestion[]> {
		const path = API_ENDPOINTS.bookingQuestions.byActivityOption.path(optionId);
		const response = await apiClient.request<BookingQuestion[]>(fetchFn, path, {
			method: 'GET',
			tag: 'BOOKING_QUESTIONS'
		});
		return response.data;
	}
};
