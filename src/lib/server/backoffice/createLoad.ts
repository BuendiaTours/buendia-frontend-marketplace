import { v4 as uuidv4 } from 'uuid';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import type { SuperValidated } from 'sveltekit-superforms';
import type { ValidationAdapter } from 'sveltekit-superforms/adapters';
import { ApiError } from '$core/_shared/errors';
import { logger } from '$lib/utils/logger';
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
	/** Label para breadcrumbs (ej: 'Nueva actividad', 'Nueva atracción') */
	breadcrumbLabel: string;
	/** Nombre de la entidad para mensajes de error (ej: 'actividad', 'atracción') */
	entityName: string;
};

/**
 * Crea una función load genérica para páginas de creación.
 *
 * Este factory maneja:
 * - Generación automática de UUID único (server-side)
 * - Carga de listas disponibles (tags, categories, destinations, etc.)
 * - Inicialización del formulario con valores por defecto
 * - Generación de breadcrumbs
 * - Manejo consistente de errores
 *
 * @example
 * ```typescript
 * import { createCreateLoad } from '$lib/server/createLoad';
 * import { ACTIVITY_REQUEST } from '$core/activities/requests';
 * import { activityFormSchema } from './activity-form.schema';
 * import { zod } from 'sveltekit-superforms/adapters';
 *
 * export const load = createCreateLoad({
 *   schema: zod(activityFormSchema),
 *   initialValues: {
 *     title: '',
 *     slug: '',
 *     status: 'DRAFT',
 *     categories: [],
 *     tags: []
 *   },
 *   loadAvailableData: async (fetch) => ({
 *     availableTags: await fetch(...).then(r => r.json()),
 *     availableCategories: await api.categories.getAll(fetch)
 *   }),
 *   breadcrumbLabel: 'Nueva actividad',
 *   entityName: 'actividad'
 * });
 * ```
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
		const { schema, initialValues, loadAvailableData, breadcrumbLabel, entityName } = config;

		try {
			logger.log(`📦 [createLoad] Iniciando load para crear [${entityName}]`);

			// 1. Generar UUID único (server-side por seguridad)
			const dataWithUuid = {
				id: uuidv4(),
				...initialValues
			};

			logger.log(`📦 [createLoad] UUID generado:`, dataWithUuid.id);

			// 2. Cargar listas disponibles (si se proporciona la función)
			let availableData = {} as A;
			if (loadAvailableData) {
				logger.log(`📦 [createLoad] Cargando datos disponibles para [${entityName}]...`);
				availableData = await loadAvailableData(fetch);
				logger.log(`✅ [createLoad] Datos cargados:`, Object.keys(availableData));
			}

			// 3. Inicializar formulario con valores por defecto + UUID (sin errores iniciales)
			const form = await superValidate(dataWithUuid, schema, { errors: false });
			logger.log(`📦 [createLoad] Formulario inicializado`);

			// 4. Generar breadcrumbs
			const breadcrumbs = buildBreadcrumbs(url.pathname, {
				label: breadcrumbLabel
			});

			// 5. Retornar data completa
			return {
				form,
				...availableData,
				breadcrumbs
			};
		} catch (err) {
			console.error(`❌ [createLoad] Error al cargar página de creación de [${entityName}]:`, err);

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
