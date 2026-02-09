import { redirect, fail } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { ApiError } from '$lib/api/index';
import { setFlashMessage } from '$lib/server/backoffice/flashMessages';
import { superValidate } from 'sveltekit-superforms';

/**
 * Configuración para crear un action handler de actualización/guardado
 */
export interface UpdateActionConfig {
	/** Ruta base para redirección después de guardar (ej: '/activities', '/destinations') */
	basePath: string;
	/** Schema de validación (adaptador de Zod) */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	schema: any;
	/** Función que realiza la actualización en la API */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	updateFn: (fetchFn: typeof globalThis.fetch, slug: string, data: any) => Promise<any>;
	/** Función opcional para transformar los datos del formulario antes de enviarlos a la API */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	transformData?: (formData: any) => any;
	/** Si true, redirige a la página de edición; si false, redirige a la página de detalle */
	redirectToEdit?: boolean;
}

/**
 * Crea un action handler genérico para actualizar/guardar recursos.
 *
 * @example
 * ```typescript
 * import { createUpdateAction } from '$lib/server/updateAction';
 * import { api } from '$lib/api/index';
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
export function createUpdateAction(config: UpdateActionConfig) {
	return async ({ request, params, fetch, cookies }: RequestEvent) => {
		const slug = params.slug;
		if (!slug) {
			throw new Error('Slug parameter is required');
		}

		console.log('💾 [updateAction] Procesando guardado para:', slug);

		const form = await superValidate(request, config.schema);
		console.log('💾 [updateAction] Validación:', form.valid ? '✅ Válido' : '❌ Inválido');

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
			console.log('💾 [updateAction] Llamando a API para actualizar...');

			// Transformar datos si se proporciona función de transformación
			const dataToSend = config.transformData ? config.transformData(form.data) : form.data;

			const result = await config.updateFn(fetch, slug, dataToSend);
			console.log('✅ [updateAction] API respondió exitosamente:', result);

			setFlashMessage(cookies, {
				type: 'success',
				message: 'Los cambios se guardaron correctamente.'
			});

			// Redirigir a edición o detalle según configuración
			const redirectPath = config.redirectToEdit
				? `${config.basePath}/${slug}/edit`
				: `${config.basePath}/${slug}`;

			console.log('💾 [updateAction] Redirigiendo a:', redirectPath);
			throw redirect(303, redirectPath);
		} catch (err) {
			console.error('❌ [updateAction] Error capturado:', err);
			console.error('❌ [updateAction] Tipo de error:', err?.constructor?.name);

			// Si es un redirect, dejarlo pasar (es el comportamiento esperado)
			if (err && typeof err === 'object' && 'status' in err && err.status === 303) {
				console.log('✅ [updateAction] Es un redirect, dejándolo pasar');
				throw err;
			}

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
