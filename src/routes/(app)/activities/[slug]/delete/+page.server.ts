import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { setFlashMessage } from '$lib/server/flashMessages';

export const actions: Actions = {
	default: async ({ params, fetch, url, cookies }) => {
		const { slug } = params;

		// Llamar a la API para eliminar
		const res = await fetch(`${PUBLIC_API_BASE_URL}/activities/${slug}`, {
			method: 'DELETE'
		});

		if (!res.ok) {
			return fail(res.status, {
				alert: {
					type: 'error',
					message: `Error al eliminar la actividad (${res.status})`
				}
			});
		}

		// Establecer mensaje de éxito
		setFlashMessage(cookies, {
			type: 'success',
			message: 'Actividad eliminada correctamente'
		});

		// Preservar los filtros de la URL al redirigir
		const searchParams = url.searchParams.toString();
		const redirectUrl = searchParams ? `/activities?${searchParams}` : '/activities';

		throw redirect(303, redirectUrl);
	}
};
