import { activityFormSchema } from '../../activity-form.schema';
import { api, ApiError } from '$lib/api/index';
import { apiConfig } from '$lib/api/config';
import { buildBreadcrumbs } from '$lib/utils/breadcrumbs';
import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { setFlashMessage } from '$lib/server/flashMessages';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ fetch, params, url }) => {
	try {
		const [
			activity,
			tagsResponse,
			categoriesResponse,
			attractionsResponse,
			destinationsResponse,
			distributivesResponse,
			statusResponse,
			kindsResponse,
			guideKindsResponse
		] = await Promise.all([
			api.activities.getBySlug(fetch, params.slug),
			fetch(`${apiConfig.baseURL}/tags`).then((res) => res.json()),
			api.categories.getAll(fetch),
			api.attractions.getAll(fetch),
			api.destinations.getAll(fetch),
			api.distributives.getAll(fetch),
			api.activities.getStatuses(fetch),
			api.activities.getKinds(fetch),
			api.activities.getGuideKinds(fetch)
		]);

		const apiData = activity as any;
		const firstOption = apiData.options?.[0];

		const form = await superValidate(
			{
				attractions: apiData.attractions || [],
				categories: apiData.categories || [],
				codeRef: apiData.codeRef || '',
				currency: firstOption?.pricing?.defaultPricing?.currency || 'EUR',
				descriptionFull: apiData.descriptionFull || '',
				descriptionShort: apiData.descriptionShort || '',
				id: apiData.id || '',
				infoImportant: apiData.infoImportant || '',
				isFreeTour: false,
				location: apiData.location?.city || '',
				priceFrom: firstOption?.pricing?.defaultPricing?.from || 0,
				slug: apiData.slug || '',
				tags: apiData.tags || [],
				title: apiData.title || '',
				excluded: apiData.excluded || [],
				included: apiData.included || [],
				destinations: apiData.destinations || [],
				distributives: apiData.distributives || [],
				stages: apiData.stages || [],
				status: apiData.status || 'DRAFT',
				kind: apiData.kind || '',
				guideKind: apiData.guideKind || '',
				phoneContact: apiData.phoneContact || ''
			},
			zod(activityFormSchema)
		);

		const breadcrumbs = buildBreadcrumbs(url.pathname, {
			label: apiData.title || 'Actividad'
		});

		return {
			activity,
			form,
			availableTags: tagsResponse,
			availableCategories: categoriesResponse,
			availableAttractions: attractionsResponse.data || [],
			availableDestinations: destinationsResponse.data || [],
			availableDistributives: distributivesResponse || [],
			availableStatuses: statusResponse || [],
			availableKinds: kindsResponse || [],
			availableGuideKinds: guideKindsResponse || [],
			breadcrumbs
		};
	} catch (err) {
		if (err instanceof ApiError) {
			if (err.type === 'not_found') {
				throw error(404, 'Actividad no encontrada');
			}
			throw error(err.status || 500, `Error API: ${err.status || 'desconocido'}`);
		}

		throw error(503, 'No se pudo conectar con el servidor');
	}
};

export const actions: Actions = {
	default: async ({ request, params, fetch, cookies }) => {
		console.log('📝 [edit action] Formulario recibido para:', params.slug);

		const form = await superValidate(request, zod(activityFormSchema));
		console.log('📝 [edit action] Validación:', form.valid ? '✅ Válido' : '❌ Inválido');

		if (!form.valid) {
			console.error('📝 [edit action] Errores de validación:', form.errors);
			setFlashMessage(cookies, {
				type: 'error',
				message: 'Por favor, corrige los errores del formulario.'
			});
			return fail(400, { form });
		}

		try {
			console.log('📝 [edit action] Llamando a API para actualizar...');
			const result = await api.activities.update(fetch, params.slug, {
				id: form.data.id,
				codeRef: form.data.codeRef,
				title: form.data.title,
				slug: form.data.slug,
				descriptionShort: form.data.descriptionShort,
				descriptionFull: form.data.descriptionFull,
				tags: form.data.tags,
				categories: form.data.categories,
				excluded: form.data.excluded,
				included: form.data.included,
				destinations: form.data.destinations,
				distributives: form.data.distributives,
				status: form.data.status,
				phoneContact: form.data.phoneContact,
				infoImportant: form.data.infoImportant,
				priceFrom: form.data.priceFrom,
				currency: form.data.currency,
				isFreeTour: form.data.isFreeTour,
				attractions: form.data.attractions
			} as any);

			console.log('✅ [edit action] API respondió exitosamente:', result);

			setFlashMessage(cookies, {
				type: 'success',
				message: 'Los cambios se guardaron correctamente.'
			});

			const redirectPath = `/activities/${params.slug}/edit`;
			console.log('📝 [edit action] Redirigiendo a:', redirectPath);

			throw redirect(303, redirectPath);
		} catch (err) {
			console.error('❌ [edit action] Error capturado:', err);
			console.error('❌ [edit action] Tipo de error:', err?.constructor?.name);

			// Si es un redirect, dejarlo pasar
			if (err && typeof err === 'object' && 'status' in err && err.status === 303) {
				console.log('✅ [edit action] Es un redirect, dejándolo pasar');
				throw err;
			}

			let errorMessage = 'Error al guardar los cambios.';

			if (err instanceof ApiError && err.status) {
				console.error('❌ [edit action] ApiError con status:', err.status);
				switch (err.status) {
					case 400:
						errorMessage = 'Los datos enviados no son válidos.';
						break;
					case 404:
						errorMessage = 'El elemento no existe.';
						break;
					case 409:
						errorMessage = 'Ya existe un elemento con estos datos. Verifica el slug o nombre.';
						break;
					case 500:
						errorMessage = 'Error del servidor. Por favor, inténtalo más tarde.';
						break;
					default:
						errorMessage = `Error al guardar los cambios (código ${err.status}).`;
				}
			}

			setFlashMessage(cookies, {
				type: 'error',
				message: errorMessage
			});

			console.error('❌ [edit action] Retornando form con error');
			return fail(err instanceof ApiError ? err.status || 500 : 503, { form });
		}
	}
};
