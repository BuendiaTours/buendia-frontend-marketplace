import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { api, ApiError } from '$lib/api/index';
import { setFlashMessage } from '$lib/server/flashMessages';

export const actions: Actions = {
	default: async ({ params, fetch, url, cookies, request }) => {
		const { slug } = params;
		const referer = request.headers.get('referer') || '/destinations';
		const refererUrl = new URL(referer);
		const fromPath = refererUrl.pathname;

		try {
			await api.destinations.delete(fetch, slug);

			setFlashMessage(cookies, {
				type: 'success',
				message: 'Destino eliminado correctamente'
			});

			const searchParams = url.searchParams.toString();
			const redirectUrl = searchParams ? `/destinations?${searchParams}` : '/destinations';

			throw redirect(303, redirectUrl);
		} catch (err) {
			let errorMessage = 'Error al eliminar el destino';

			if (err instanceof ApiError) {
				switch (err.type) {
					case 'not_found':
						errorMessage = 'El destino no existe o ya fue eliminado';
						break;
					case 'forbidden':
						errorMessage = 'No tienes permisos para eliminar este destino';
						break;
					case 'server_error':
						errorMessage = 'Error del servidor. Por favor, inténtalo más tarde';
						break;
					default:
						errorMessage = `Error al eliminar el destino (${err.status || 'desconocido'})`;
				}
			}

			setFlashMessage(cookies, {
				type: 'error',
				message: errorMessage
			});

			const searchParams = url.searchParams.toString();
			const backUrl = searchParams ? `${fromPath}?${searchParams}` : fromPath;

			throw redirect(303, backUrl);
		}
	}
};
