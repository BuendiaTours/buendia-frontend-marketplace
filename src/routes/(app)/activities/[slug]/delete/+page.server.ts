import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { setFlashMessage } from '$lib/server/flashMessages';

export const actions: Actions = {
	default: async ({ params, fetch, url, cookies, request }) => {
		const { slug } = params;

		// Obtener el referer para saber de dónde viene el usuario
		const referer = request.headers.get('referer') || '/activities';
		const refererUrl = new URL(referer);
		const fromPath = refererUrl.pathname;

		// Llamar a la API para eliminar
		const res = await fetch(`${PUBLIC_API_BASE_URL}/activities/${slug}`, {
			method: 'DELETE'
		});

		if (!res.ok) {
			// Mensajes de error específicos según el código HTTP
			let errorMessage = 'Error al eliminar la actividad';

			switch (res.status) {
				case 404:
					errorMessage = 'La actividad no existe o ya fue eliminada';
					break;
				case 403:
					errorMessage = 'No tienes permisos para eliminar esta actividad';
					break;
				case 409:
					errorMessage = 'No se puede eliminar: la actividad tiene reservas activas';
					break;
				case 500:
				case 502:
				case 503:
					errorMessage = 'Error del servidor. Por favor, inténtalo más tarde';
					break;
				default:
					errorMessage = `Error al eliminar la actividad (${res.status})`;
			}

			// Si hay error, establecer flash message y redirigir de vuelta
			setFlashMessage(cookies, {
				type: 'error',
				message: errorMessage
			});

			// Volver a la página anterior con los mismos query params
			const searchParams = url.searchParams.toString();
			const backUrl = searchParams ? `${fromPath}?${searchParams}` : fromPath;

			throw redirect(303, backUrl);
		}

		// Establecer mensaje de éxito
		setFlashMessage(cookies, {
			type: 'success',
			message: 'Actividad eliminada correctamente'
		});

		// Preservar los filtros de la URL al redirigir al listado
		const searchParams = url.searchParams.toString();
		const redirectUrl = searchParams ? `/activities?${searchParams}` : '/activities';

		throw redirect(303, redirectUrl);
	}
};
