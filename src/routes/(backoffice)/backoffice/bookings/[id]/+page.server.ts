/**
 * Server load and actions for the booking detail page.
 * Loads booking data for read-only display and provides a cancel action.
 */
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { BOOKING_REQUEST } from '$core/bookings/requests';
import { BookingStatus } from '$core/bookings/enums';
import { ApiError } from '$core/_shared/errors';
import { setFlashMessage } from '$lib/server/backoffice/flashMessages';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const booking = await BOOKING_REQUEST.findById(fetch, params.id);
		return { booking };
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500);
		}
		throw error(503);
	}
};

export const actions: Actions = {
	cancel: async ({ fetch, params, cookies, url }) => {
		try {
			await BOOKING_REQUEST.update(fetch, params.id, {
				status: BookingStatus.CANCELLED
			});

			setFlashMessage(cookies, {
				type: 'success',
				message: 'La reserva ha sido cancelada correctamente.',
				code: 'cancel.success'
			});

			const searchParams = url.searchParams.toString();
			const basePath = `${BACKOFFICE_PREFIX}/bookings`;
			const redirectUrl = searchParams ? `${basePath}?${searchParams}` : basePath;

			await new Promise((resolve) => setTimeout(resolve, 500));
			throw redirect(303, redirectUrl);
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err && err.status === 303) {
				throw err;
			}

			let errorMessage = 'Error al cancelar la reserva.';
			if (err instanceof ApiError && err.status) {
				switch (err.status) {
					case 400:
						errorMessage = 'La solicitud de cancelación no es válida.';
						break;
					case 403:
						errorMessage = 'No tienes permisos para cancelar esta reserva.';
						break;
					case 404:
						errorMessage = 'La reserva no existe.';
						break;
					default:
						errorMessage = `Error al cancelar la reserva (código ${err.status}).`;
				}
			}

			setFlashMessage(cookies, {
				type: 'error',
				message: errorMessage,
				code: 'cancel.error'
			});

			throw redirect(303, `${BACKOFFICE_PREFIX}/bookings/${params.id}`);
		}
	}
};
