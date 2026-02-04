import { v4 as uuidv4 } from 'uuid';
import { activityFormSchema } from '../activity-form.schema';
import { api, ApiError } from '$lib/api/index';
import { apiConfig } from '$lib/api/config';
import { buildBreadcrumbs } from '$lib/utils/breadcrumbs';
import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { setFlashMessage } from '$lib/server/flashMessages';
import type { PageServerLoad, Actions } from './$types';

/**
 * Load function para crear nueva actividad
 *
 * Genera un formulario vacío con valores por defecto:
 * - UUID único generado en servidor
 * - Status DRAFT
 * - Arrays vacíos para relaciones
 * - Campos de texto vacíos
 */
export const load: PageServerLoad = async ({ fetch, url }) => {
	try {
		// Cargar listas disponibles en paralelo
		const [
			tagsResponse,
			categoriesResponse,
			attractionsResponse,
			destinationsResponse,
			distributivesResponse
		] = await Promise.all([
			fetch(`${apiConfig.baseURL}/tags`).then((res) => res.json()),
			api.categories.getAll(fetch),
			api.attractions.getAll(fetch),
			api.destinations.getAll(fetch),
			api.distributives.getAll(fetch)
		]);

		// Crear formulario con valores iniciales mínimos
		const form = await superValidate(
			{
				// Identificadores
				id: uuidv4(), // Generar UUID único en servidor
				title: '',
				slug: '',
				codeRef: '',

				// Descripciones
				descriptionFull: '',
				descriptionShort: '',
				infoImportant: '',

				// Estado y tipos
				status: 'DRAFT', // Por defecto DRAFT para nuevas actividades
				kind: '',
				guideKind: '',

				// Relaciones (arrays vacíos)
				categories: [],
				tags: [],
				attractions: [],
				destinations: [],
				distributives: [],

				// Listas de elementos
				stages: [],
				meals: [],
				included: [],
				excluded: [],
				itemsToBring: [],
				notSuitableFor: []
			},
			zod(activityFormSchema)
		);

		const breadcrumbs = buildBreadcrumbs(url.pathname, {
			label: 'Nueva actividad'
		});

		return {
			form,
			availableTags: tagsResponse,
			availableCategories: categoriesResponse,
			availableAttractions: attractionsResponse.data || [],
			availableDestinations: destinationsResponse.data || [],
			availableDistributives: distributivesResponse || [],
			breadcrumbs
		};
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500, `Error API: ${err.status || 'desconocido'}`);
		}

		throw error(503, 'No se pudo conectar con el servidor');
	}
};

/**
 * Action para crear una nueva actividad
 *
 * Valida los datos del formulario y llama a api.activities.create()
 * En caso de éxito, redirige a la página de edición de la nueva actividad
 */
export const actions: Actions = {
	default: async ({ request, fetch, cookies }) => {
		console.log('🆕 [createActivity] Iniciando creación de actividad');

		const form = await superValidate(request, zod(activityFormSchema));
		console.log('🆕 [createActivity] Validación:', form.valid ? '✅ Válido' : '❌ Inválido');

		if (!form.valid) {
			console.error('🆕 [createActivity] Errores de validación:', form.errors);
			const errorMessage = 'Por favor, corrige los errores del formulario.';
			setFlashMessage(cookies, {
				type: 'error',
				message: errorMessage
			});
			return fail(400, {
				form,
				alert: {
					type: 'error',
					message: errorMessage
				}
			});
		}

		try {
			console.log('🆕 [createActivity] Llamando a API para crear actividad...');
			console.log('🆕 [createActivity] Datos a enviar:', {
				id: form.data.id,
				title: form.data.title,
				slug: form.data.slug
			});

			// Llamar a la API para crear la actividad
			// NOTA: Usamos 'as any' temporalmente porque el tipo ActivityListItem
			// tiene 'meals: string[]' pero el formulario envía objetos completos
			// TODO: Actualizar el tipo ActivityListItem cuando la API lo soporte
			const result = await api.activities.create(fetch, form.data as any);
			console.log('✅ [createActivity] Elemento creado exitosamente:', result);

			setFlashMessage(cookies, {
				type: 'success',
				message: 'Elemento creado correctamente.'
			});

			// Redirigir a la página de edición de la nueva actividad
			const redirectPath = `/activities/${result.slug}/edit`;
			console.log('🆕 [createActivity] Redirigiendo a:', redirectPath);
			throw redirect(303, redirectPath);
		} catch (err) {
			console.error('❌ [createActivity] Error capturado:', err);
			console.error('❌ [createActivity] Tipo de error:', err?.constructor?.name);

			// Si es un redirect, dejarlo pasar (es el comportamiento esperado)
			if (err && typeof err === 'object' && 'status' in err && err.status === 303) {
				console.log('✅ [createActivity] Es un redirect, dejándolo pasar');
				throw err;
			}

			let errorMessage = 'Error al crear la actividad.';

			if (err instanceof ApiError && err.status) {
				console.error('❌ [createActivity] ApiError con status:', err.status);
				switch (err.status) {
					case 400: // Bad Request - Solicitud inválida
						errorMessage = 'Los datos enviados no son válidos.';
						break;
					case 401: // Unauthorized - No autenticado
						errorMessage = 'Debes iniciar sesión para crear este elemento.';
						break;
					case 403: // Forbidden - No autorizado
						errorMessage = 'No tienes permisos para crear este elemento.';
						break;
					case 404: // Forbidden - No autorizado
						errorMessage = 'No existe el endpoint de creación en la API (?).';
						break;
					case 409: // Conflict - Conflicto (ej: slug duplicado)
						errorMessage =
							'Ya existe un elemento con este slug. Por favor, elige otro título o slug.';
						break;
					case 422: // Unprocessable Entity - Validación fallida en servidor
						errorMessage = 'Los datos no cumplen con los requisitos del servidor.';
						break;
					case 500: // Internal Server Error - Error del servidor
						errorMessage = 'Error del servidor. Por favor, inténtalo más tarde.';
						break;
					case 503: // Service Unavailable - Servicio no disponible
						errorMessage = 'El servicio no está disponible. Por favor, inténtalo más tarde.';
						break;
					default:
						errorMessage = `Error al crear el elemento (código ${err.status}).`;
				}

				setFlashMessage(cookies, {
					type: 'error',
					message: errorMessage
				});

				return fail(err.status || 500, {
					form,
					alert: {
						type: 'error',
						message: errorMessage
					}
				});
			}

			// Error desconocido
			console.error('❌ [createActivity] Error desconocido');
			const unknownErrorMessage =
				'Error inesperado al crear la actividad. Por favor, inténtalo de nuevo.';
			setFlashMessage(cookies, {
				type: 'error',
				message: unknownErrorMessage
			});

			return fail(503, {
				form,
				alert: {
					type: 'error',
					message: unknownErrorMessage
				}
			});
		}
	}
};
