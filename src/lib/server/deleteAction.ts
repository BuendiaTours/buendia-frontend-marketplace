import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { ApiError } from '$lib/api/index';
import { setFlashMessage } from '$lib/server/flashMessages';

/**
 * Configuración para crear un action handler de eliminación
 */
export interface DeleteActionConfig {
	/** Nombre del recurso en singular (ej: 'actividad', 'destino') */
	resourceName: string;
	/** Nombre del recurso en singular con artículo (ej: 'la actividad', 'el destino') */
	resourceNameWithArticle: string;
	/** Ruta base para redirección (ej: '/activities', '/destinations') */
	basePath: string;
	/** Función que realiza la eliminación en la API */
	deleteFn: (fetchFn: typeof globalThis.fetch, slug: string) => Promise<void>;
}

/**
 * Crea un action handler genérico para eliminar recursos.
 *
 * @example
 * ```typescript
 * import { createDeleteAction } from '$lib/server/deleteAction';
 * import { api } from '$lib/api/index';
 *
 * export const actions = {
 *   default: createDeleteAction({
 *     resourceName: 'actividad',
 *     resourceNameWithArticle: 'la actividad',
 *     basePath: '/activities',
 *     deleteFn: api.activities.delete
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
			await config.deleteFn(fetch, slug);

			setFlashMessage(cookies, {
				type: 'success',
				message: 'El elemento fue eliminado correctamente.'
			});

			const searchParams = url.searchParams.toString();
			const redirectUrl = searchParams ? `${config.basePath}?${searchParams}` : config.basePath;

			throw redirect(303, redirectUrl);
		} catch (err) {
			let errorMessage = 'Error al eliminar el elemento.';

			if (err instanceof ApiError) {
				switch (err.type) {
					case 'not_found':
						errorMessage = 'El elemento no existe o ya fue eliminado.';
						break;
					case 'forbidden':
						errorMessage = 'No tienes permisos para eliminar el elemento.';
						break;
					case 'server_error':
						errorMessage = 'Error del servidor. Por favor, inténtalo más tarde.';
						break;
					default:
						errorMessage = `Error al eliminar el elemento (${err.status || 'desconocido'}).`;
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
