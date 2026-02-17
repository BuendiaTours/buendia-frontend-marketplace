import { redirect, fail, isRedirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { ApiError } from '$core/_shared/errors';
import { setFlashMessage } from '$lib/server/backoffice/flashMessages';
import { logger } from '$lib/utils/logger';
import { superValidate } from 'sveltekit-superforms';
import type { ValidationAdapter } from 'sveltekit-superforms/adapters';

/**
 * Configuración para crear un action handler de actualización/guardado
 */
export type UpdateActionConfig<T extends Record<string, unknown> = Record<string, unknown>> = {
	/** Ruta base para redirección después de guardar (ej: '/activities', '/destinations') */
	basePath: string;
	/** Schema de validación (adaptador de Zod) */
	schema: ValidationAdapter<T>;
	/** Función que realiza la actualización en la API */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	updateFn: (fetchFn: typeof globalThis.fetch, slug: string, data: any) => Promise<void>;
	/** Función opcional para transformar los datos del formulario antes de enviarlos a la API */
	transformData?: (formData: T) => Record<string, unknown>;
	/** Si true, redirige a la página de edición; si false, redirige a la página de detalle */
	redirectToEdit?: boolean;
};

/**
 * Crea un action handler genérico para actualizar/guardar recursos.
 *
 * @example
 * ```typescript
 * import { createUpdateAction } from '$lib/server/updateAction';
 * import { ACTIVITY_REQUEST } from '$core/activities/requests';
 * import { activityFormSchema } from './activity-form.schema';
 * import { zod } from 'sveltekit-superforms/adapters';
 *
 * export const actions = {
 *   default: createUpdateAction({
 *     basePath: '/activities',
 *     schema: zod(activityFormSchema),
 *     updateFn: api.activities.update,
 *     redirectToEdit: true
 *   })
 * };
 * ```
 */
export function createUpdateAction<T extends Record<string, unknown>>(
	config: UpdateActionConfig<T>
) {
	return async ({ request, params, fetch, cookies }: RequestEvent) => {
		const slug = params.slug;
		if (!slug) {
			throw new Error('Slug parameter is required');
		}

		logger.log('💾 [updateAction] Procesando guardado para:', slug);

		const form = await superValidate(request, config.schema);
		logger.log('💾 [updateAction] Validación:', form.valid ? '✅ Válido' : '❌ Inválido');

		if (!form.valid) {
			console.error('💾 [updateAction] Errores de validación:', form.errors);
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
			logger.log('💾 [updateAction] Llamando a API para actualizar...');

			// Transformar datos si se proporciona función de transformación
			const dataToSend = config.transformData ? config.transformData(form.data) : form.data;

			await config.updateFn(fetch, slug, dataToSend);
			logger.log('✅ [updateAction] API respondió exitosamente');

			setFlashMessage(cookies, {
				type: 'success',
				message: 'Los cambios se guardaron correctamente.'
			});

			// Redirigir a edición o detalle según configuración
			const redirectPath = config.redirectToEdit
				? `${config.basePath}/${slug}/edit`
				: `${config.basePath}/${slug}`;

			logger.log('💾 [updateAction] Redirigiendo a:', redirectPath);
			throw redirect(303, redirectPath);
		} catch (err) {
			// Si es un redirect, re-lanzarlo para que SvelteKit lo maneje
			if (isRedirect(err)) {
				throw err;
			}

			console.error('❌ [updateAction] Error capturado:', err);

			let errorMessage = 'Error al guardar los cambios.';

			if (err instanceof ApiError && err.status) {
				console.error('❌ [updateAction] ApiError con status:', err.status);
				switch (err.status) {
					case 400: // Bad Request - Solicitud inválida
						errorMessage = 'Los datos enviados no son válidos.';
						break;
					case 401: // Unauthorized - No autenticado
						errorMessage = 'Debes iniciar sesión para guardar cambios.';
						break;
					case 403: // Forbidden - No autorizado
						errorMessage = 'No tienes permisos para modificar este elemento.';
						break;
					case 404: // Not Found - Elemento no encontrado
						errorMessage = 'El elemento no existe.';
						break;
					case 409: // Conflict - Conflicto (ej: slug duplicado)
						errorMessage = 'Ya existe un elemento con estos datos. Verifica el slug o nombre.';
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
						errorMessage = `Error al guardar los cambios (código ${err.status}).`;
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
			console.error('❌ [updateAction] Error desconocido');
			const unknownErrorMessage = 'Error inesperado al guardar. Por favor, inténtalo de nuevo.';
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
	};
}
