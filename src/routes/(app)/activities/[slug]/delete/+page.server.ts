import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { PUBLIC_API_BASE_URL } from '$env/static/public';

export const actions: Actions = {
	default: async ({ params, fetch, url }) => {
		const { slug } = params;

		// Llamar a la API para eliminar
		const res = await fetch(`${PUBLIC_API_BASE_URL}/activities/${slug}`, {
			method: 'DELETE'
		});

		if (!res.ok) {
			return fail(res.status, {
				error: `Error al eliminar la actividad (${res.status})`
			});
		}

		// Preservar los filtros de la URL al redirigir
		const searchParams = url.searchParams.toString();
		const redirectUrl = searchParams ? `/activities?${searchParams}` : '/activities';

		throw redirect(303, redirectUrl);
	}
};
