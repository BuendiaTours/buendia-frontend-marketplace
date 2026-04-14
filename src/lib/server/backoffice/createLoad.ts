import { v4 as uuidv4 } from 'uuid';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import type { SuperValidated } from 'sveltekit-superforms';
import type { ValidationAdapter } from 'sveltekit-superforms/adapters';
import { ApiError } from '$core/_shared/errors';
import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';

/**
 * Configuración para crear una función load de creación
 */
export type CreateLoadConfig<
	T extends Record<string, unknown> = Record<string, unknown>,
	A extends Record<string, unknown> = Record<string, unknown>
> = {
	/** Schema de validación (adaptador de Zod) */
	schema: ValidationAdapter<T>;
	/** Valores iniciales del formulario (sin UUID, se genera automáticamente) */
	initialValues: Partial<T>;
	/** Función async que carga listas disponibles (tags, categories, etc.) - Opcional */
	loadAvailableData?: (fetch: typeof globalThis.fetch) => Promise<A>;
	/** Label para breadcrumbs (ej: 'Nueva actividad'). Si no se pasa, no se generan breadcrumbs desde el server */
	breadcrumbLabel?: string;
	/** Nombre de la entidad para mensajes de error (ej: 'actividad'). Defaults to 'elemento' */
	entityName?: string;
};

/**
 * Crea una función load genérica para páginas de creación.
 *
 * Este factory maneja:
 * - Generación automática de UUID único (server-side)
 * - Carga de listas disponibles (tags, categories, locations, etc.)
 * - Inicialización del formulario con valores por defecto
 * - Generación de breadcrumbs (opcional — preferir construirlos en la page)
 * - Manejo consistente de errores
 */
export function createCreateLoad<
	T extends Record<string, unknown>,
	A extends Record<string, unknown> = Record<string, unknown>
>(config: CreateLoadConfig<T, A>) {
	return async ({
		fetch,
		url
	}: {
		fetch: typeof globalThis.fetch;
		url: URL;
	}): Promise<
		{
			form: SuperValidated<T>;
			breadcrumbs: ReturnType<typeof buildBreadcrumbs>;
		} & A
	> => {
		const {
			schema,
			initialValues,
			loadAvailableData,
			breadcrumbLabel,
			entityName = 'elemento'
		} = config;

		try {
			// 1. Generar UUID único (server-side por seguridad)
			const dataWithUuid = {
				id: uuidv4(),
				...initialValues
			};

			// 2. Cargar listas disponibles (si se proporciona la función)
			let availableData = {} as A;
			if (loadAvailableData) {
				availableData = await loadAvailableData(fetch);
			}

			// 3. Inicializar formulario con valores por defecto + UUID (sin errores iniciales)
			const form = await superValidate(dataWithUuid, schema, { errors: false });

			// 4. Generar breadcrumbs (vacíos si no se proporcionó label — la page los construye)
			const breadcrumbs = breadcrumbLabel
				? buildBreadcrumbs(url.pathname, { label: breadcrumbLabel })
				: [];

			return {
				form,
				breadcrumbs,
				...availableData
			};
		} catch (err) {
			console.error(`[createLoad] Error loading create page for [${entityName}]:`, err);

			if (err instanceof ApiError) {
				throw error(
					err.status || 500,
					`Error al cargar datos: ${err.message || 'Error desconocido'}`
				);
			}

			throw error(503, `No se pudo cargar la página de creación de [${entityName}].`);
		}
	};
}
