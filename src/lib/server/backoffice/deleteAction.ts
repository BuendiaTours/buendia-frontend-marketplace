import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { ApiError } from '$core/_shared/errors';
import { setFlashMessage } from '$lib/server/backoffice/flashMessages';
import { logger } from '$lib/utils/logger';

/**
 * Configuración para crear un action handler de eliminación
 */
export type DeleteActionConfig = {
	/** Ruta base para redirección (ej: '/activities', '/locations') */
	basePath: string;
	/** Función que realiza la eliminación en la API */
	deleteFn: (fetchFn: typeof globalThis.fetch, identifier: string) => Promise<void>;
	/** Nombre del parámetro de ruta que identifica el recurso (default: 'id') */
	paramName?: string;
};

/**
 * Crea un action handler genérico para eliminar recursos.
 */
export function createDeleteAction(config: DeleteActionConfig) {
	return async ({ params, fetch, url, cookies, request }: RequestEvent) => {
		const identifier = (params as Record<string, string | undefined>)[config.paramName ?? 'id'];
		if (!identifier) {
			throw new Error(`Route parameter '${config.paramName ?? 'id'}' is required`);
		}
		const referer = request.headers.get('referer') || config.basePath;
		const refererUrl = new URL(referer);
		const fromPath = refererUrl.pathname;

		try {
			logger.log('🗑️ [deleteAction] Intentando eliminar:', identifier);
			const result = await config.deleteFn(fetch, identifier);
			logger.log('✅ [deleteAction] Eliminación exitosa:', result);

			setFlashMessage(cookies, {
				type: 'success',
				message: 'El elemento fue eliminado correctamente.',
				code: 'delete.success'
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
			let errorCode = 'error.unknown';

			if (err instanceof ApiError && err.status) {
				switch (err.status) {
					case 400:
						errorMessage = 'La solicitud de eliminación no es válida.';
						errorCode = 'error.400';
						break;
					case 401:
						errorMessage = 'Debes iniciar sesión para eliminar este elemento.';
						errorCode = 'error.401';
						break;
					case 403:
						errorMessage = 'No tienes permisos para eliminar este elemento.';
						errorCode = 'error.403';
						break;
					case 404:
						errorMessage = 'El elemento no existe o ya fue eliminado.';
						errorCode = 'error.404';
						break;
					case 409:
						errorMessage =
							'No se puede eliminar el elemento porque está siendo usado por otros recursos.';
						errorCode = 'error.409';
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
						errorMessage = `Error al eliminar el elemento (código ${err.status}).`;
						errorCode = `error.${err.status}`;
				}
			}

			setFlashMessage(cookies, {
				type: 'error',
				message: errorMessage,
				code: errorCode
			});

			const searchParams = url.searchParams.toString();
			const backUrl = searchParams ? `${fromPath}?${searchParams}` : fromPath;

			throw redirect(303, backUrl);
		}
	};
}
