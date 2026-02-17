import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { ApiError } from '$core/_shared/errors';
import { setFlashMessage } from '$lib/server/backoffice/flashMessages';
import { logger } from '$lib/utils/logger';

/**
 * Configuración para crear un action handler de eliminación
 */
export type DeleteActionConfig = {
	/** Ruta base para redirección (ej: '/activities', '/destinations') */
	basePath: string;
	/** Función que realiza la eliminación en la API */
	deleteFn: (fetchFn: typeof globalThis.fetch, slug: string) => Promise<void>;
};

/**
 * Crea un action handler genérico para eliminar recursos.
 *
 * @example
 * ```typescript
 * import { createDeleteAction } from '$lib/server/deleteAction';
 * import { ACTIVITY_REQUEST } from '$core/activities/requests';
 *
 * export const actions = {
 *   default: createDeleteAction({
 *     basePath: '/activities',
 *     deleteFn: ACTIVITY_REQUEST.delete
 *   })
 * };
 * ```
 */
export function createDeleteAction(config: DeleteActionConfig) {
	return async ({ params, fetch, url, cookies, request }: RequestEvent) => {
		const slug = params.slug;
		if (!slug) {
			throw new Error('Slug parameter is required');
		}
		const referer = request.headers.get('referer') || config.basePath;
		const refererUrl = new URL(referer);
		const fromPath = refererUrl.pathname;

		try {
			logger.log('🗑️ [deleteAction] Intentando eliminar:', slug);
			const result = await config.deleteFn(fetch, slug);
			logger.log('✅ [deleteAction] Eliminación exitosa:', result);

			setFlashMessage(cookies, {
				type: 'success',
				message: 'El elemento fue eliminado correctamente.'
			});

			const searchParams = url.searchParams.toString();
			const redirectUrl = searchParams ? `${config.basePath}?${searchParams}` : config.basePath;

			throw redirect(303, redirectUrl);
		} catch (err) {
			console.error(' [deleteAction] Error capturado:', err);
			console.error(' [deleteAction] Tipo de error:', err?.constructor?.name);
			console.error(' [deleteAction] Es ApiError?:', err instanceof ApiError);

			// Si es un redirect, dejarlo pasar (es el comportamiento esperado)
			if (err && typeof err === 'object' && 'status' in err && err.status === 303) {
				logger.log(' [deleteAction] Es un redirect, dejándolo pasar');
				throw err;
			}

			let errorMessage = 'Error al eliminar el elemento.';

			if (err instanceof ApiError && err.status) {
				switch (err.status) {
					case 400: // Bad Request - Solicitud inválida
						errorMessage = 'La solicitud de eliminación no es válida.';
						break;
					case 401: // Unauthorized - No autenticado
						errorMessage = 'Debes iniciar sesión para eliminar este elemento.';
						break;
					case 403: // Forbidden - No autorizado
						errorMessage = 'No tienes permisos para eliminar este elemento.';
						break;
					case 404: // Not Found - Elemento no encontrado
						errorMessage = 'El elemento no existe o ya fue eliminado.';
						break;
					case 409: // Conflict - Conflicto (ej: elemento tiene dependencias)
						errorMessage =
							'No se puede eliminar el elemento porque está siendo usado por otros recursos.';
						break;
					case 500: // Internal Server Error - Error del servidor
						errorMessage = 'Error del servidor. Por favor, inténtalo más tarde.';
						break;
					case 503: // Service Unavailable - Servicio no disponible
						errorMessage = 'El servicio no está disponible. Por favor, inténtalo más tarde.';
						break;
					default:
						errorMessage = `Error al eliminar el elemento (código ${err.status}).`;
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
	};
}
