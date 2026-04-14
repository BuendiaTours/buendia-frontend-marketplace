import { redirect, fail, isRedirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { ApiError } from '$core/_shared/errors';
import { setFlashMessage } from '$lib/server/backoffice/flashMessages';
import { superValidate } from 'sveltekit-superforms';
import type { ValidationAdapter } from 'sveltekit-superforms/adapters';

/**
 * Configuración para crear un action handler de creación
 */
export type CreateActionConfig<T extends Record<string, unknown> = Record<string, unknown>> = {
	/** Ruta base para redirección después de crear (ej: '/activities', '/attractions') */
	basePath: string;
	/** Schema de validación (adaptador de Zod) */
	schema: ValidationAdapter<T>;
	/** Función que realiza la creación en la API */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	createFn: (fetchFn: typeof globalThis.fetch, data: any) => Promise<void>;
	/** Nombre de la entidad para mensajes legacy (ej: 'actividad', 'atracción', 'destino') */
	entityName?: string;
	/** Función opcional para transformar los datos del formulario antes de enviarlos a la API */
	transformData?: (formData: T) => Record<string, unknown>;
	/** Si true, redirige a la página de edición; si false, redirige a la página de detalle */
	redirectToEdit?: boolean;
	/** Si true, redirige al listado (basePath) ignorando redirectToEdit y redirectField */
	redirectToList?: boolean;
	/** Campo del formulario a usar como identificador en la URL de redirección (default: 'slug') */
	redirectField?: string;
	/**
	 * Delay in ms before redirecting.
	 * Useful for CQRS backends where projections need time to propagate.
	 * Defaults to 800ms when redirectToList is true, 0 otherwise.
	 */
	redirectDelayMs?: number;
	/**
	 * Query param name appended to the returnTo URL with the created resource ID.
	 * When set, the action checks for a `returnTo` search param and redirects back
	 * with `?{returnToParam}={id}` so the calling page can auto-add the resource.
	 * Example: `returnToParam: 'addLocationId'`
	 */
	returnToParam?: string;
};

/**
 * Crea un action handler genérico para crear recursos.
 *
 * Este factory maneja:
 * - Validación del formulario con el schema proporcionado
 * - Llamada a la API para crear el recurso
 * - Manejo consistente de errores con códigos para resolución i18n en el cliente
 * - Flash messages de éxito y error
 * - Redirección automática a la página de edición o detalle
 */
export function createCreateAction<T extends Record<string, unknown>>(
	config: CreateActionConfig<T>
) {
	return async ({ request, fetch, cookies, url }: RequestEvent) => {
		const {
			basePath,
			schema,
			createFn,
			entityName = 'elemento',
			transformData,
			redirectToEdit = true,
			redirectToList = false,
			redirectField = 'slug',
			redirectDelayMs,
			returnToParam
		} = config;

		const delay = redirectDelayMs ?? 500;

		// 1. Validar formulario
		const form = await superValidate(request, schema);

		if (!form.valid) {
			const errorMessage = 'Por favor, corrige los errores del formulario.';
			setFlashMessage(cookies, {
				type: 'error',
				message: errorMessage,
				code: 'error.validation'
			});
			return fail(400, {
				form,
				alert: {
					type: 'error',
					message: errorMessage,
					code: 'error.validation'
				}
			});
		}

		try {
			// 2. Transformar datos si es necesario
			const dataToSend = transformData ? transformData(form.data) : form.data;

			// 3. Llamar a la API para crear el recurso
			await createFn(fetch, dataToSend);

			// 4. Flash message de éxito
			const successMessage = `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} ${entityName.endsWith('ión') ? 'creada' : 'creado'} correctamente.`;
			setFlashMessage(cookies, {
				type: 'success',
				message: successMessage,
				code: 'create.success'
			});

			if (delay > 0) {
				await new Promise((resolve) => setTimeout(resolve, delay));
			}

			// 5a. Return-to redirect (create-and-return pattern)
			const returnTo = returnToParam ? url.searchParams.get('returnTo') : null;
			if (returnTo && returnToParam) {
				const returnUrl = new URL(returnTo, url.origin);
				returnUrl.searchParams.set(returnToParam, String(form.data.id));
				throw redirect(303, returnUrl.pathname + returnUrl.search);
			}

			// 5b. Redirigir según configuración
			let redirectPath: string;
			if (redirectToList) {
				redirectPath = basePath;
			} else {
				const identifier = form.data[redirectField];
				redirectPath = redirectToEdit
					? `${basePath}/${identifier}/edit`
					: `${basePath}/${identifier}`;
			}

			throw redirect(303, redirectPath);
		} catch (err) {
			// Si es un redirect, re-lanzarlo para que SvelteKit lo maneje (no es un error)
			if (isRedirect(err)) {
				throw err;
			}

			console.error(`[createAction] Error creating ${entityName}:`, err);

			// 6. Manejar ApiError con mensajes personalizados
			let errorMessage = `Error al crear ${entityName}.`;
			let errorCode = 'error.unknown';

			if (err instanceof ApiError && err.status) {
				// Determinar artículo (el/la) según terminación
				const article = entityName.endsWith('ión') ? 'la' : 'el';

				switch (err.status) {
					case 400:
						errorMessage = 'Los datos enviados no son válidos.';
						errorCode = 'error.400';
						break;
					case 401:
						errorMessage = `Debes iniciar sesión para crear [${entityName}].`;
						errorCode = 'error.401';
						break;
					case 403:
						errorMessage = `No tienes permisos para crear [${entityName}].`;
						errorCode = 'error.403';
						break;
					case 404:
						errorMessage = 'Endpoint de creación no encontrado en la API.';
						errorCode = 'error.404';
						break;
					case 409:
						errorMessage = `Ya existe [${entityName}] con este slug. Por favor, elige otro.`;
						errorCode = 'error.409';
						break;
					case 422:
						errorMessage = 'Los datos no cumplen con los requisitos del servidor.';
						errorCode = 'error.422';
						break;
					case 500:
						errorMessage = 'Error del servidor. Por favor, inténtalo más tarde.';
						errorCode = 'error.500';
						break;
					case 503:
						errorMessage = 'El servicio no está disponible. Por favor, inténtalo más tarde.';
						errorCode = 'error.503';
						break;
					default:
						errorMessage = `Error al crear [${article}] {${entityName}} (código ${err.status}).`;
						errorCode = `error.${err.status}`;
				}

				setFlashMessage(cookies, {
					type: 'error',
					message: errorMessage,
					code: errorCode
				});

				return fail(err.status || 500, {
					form,
					alert: {
						type: 'error',
						message: errorMessage,
						code: errorCode
					}
				});
			}

			// 7. Error desconocido
			errorMessage = `Error inesperado al crear [${entityName}]. Por favor, inténtalo de nuevo.`;
			setFlashMessage(cookies, {
				type: 'error',
				message: errorMessage,
				code: 'error.unknown'
			});

			return fail(503, {
				form,
				alert: {
					type: 'error',
					message: errorMessage,
					code: 'error.unknown'
				}
			});
		}
	};
}
