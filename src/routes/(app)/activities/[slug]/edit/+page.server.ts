import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { PUBLIC_API_BASE_URL } from '$env/static/public';
import type { ActivityDetail } from '$lib/types';

// Cargar los datos de la actividad para el formulario
export const load: PageServerLoad = async ({ fetch, params }) => {
	const res = await fetch(`${PUBLIC_API_BASE_URL}/public/activities/${params.slug}`);

	if (res.status === 404) {
		throw error(404, 'Actividad no encontrada');
	}
	if (!res.ok) {
		throw error(res.status, `Error API: ${res.status}`);
	}

	const activity: ActivityDetail = await res.json();
	return { activity };
};

// Manejar el envío del formulario
export const actions: Actions = {
	default: async ({ request, params, fetch }) => {
		const formData = await request.formData();

		// Extraer datos del formulario
		const data = {
			title: formData.get('title'),
			city: formData.get('city'),
			priceFrom: Number(formData.get('priceFrom')),
			currency: formData.get('currency'),
			description: formData.get('description')
		};

		// Validación básica
		if (!data.title || !data.city || !data.priceFrom || !data.currency) {
			return fail(400, {
				error: 'Todos los campos son obligatorios',
				values: data
			});
		}

		// Enviar actualización a la API
		const res = await fetch(`${PUBLIC_API_BASE_URL}/public/activities/${params.slug}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});

		if (!res.ok) {
			return fail(res.status, {
				error: `Error al actualizar: ${res.status}`,
				values: data
			});
		}

		// Redirigir a la página de detalle después de guardar
		throw redirect(303, `/activities/${params.slug}`);
	}
};
