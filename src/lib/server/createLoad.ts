import { v4 as uuidv4 } from 'uuid';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { ApiError } from '$lib/api/index';
import { buildBreadcrumbs } from '$lib/utils/breadcrumbs';

/**
 * Configuración para crear una función load de creación
 */
export interface CreateLoadConfig {
	/** Schema de validación (adaptador de Zod) */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	schema: any;
	/** Valores iniciales del formulario (sin UUID, se genera automáticamente) */
	initialValues: Record<string, any>;
	/** Función async que carga listas disponibles (tags, categories, etc.) - Opcional */
	loadAvailableData?: (fetch: typeof globalThis.fetch) => Promise<Record<string, any>>;
	/** Label para breadcrumbs (ej: 'Nueva actividad', 'Nueva atracción') */
	breadcrumbLabel: string;
	/** Nombre de la entidad para mensajes de error (ej: 'actividad', 'atracción') */
	entityName: string;
}

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
 * import { api } from '$lib/api/index';
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
export function createCreateLoad(config: CreateLoadConfig) {
	return async ({ fetch, url }: { fetch: typeof globalThis.fetch; url: URL }) => {
		const { schema, initialValues, loadAvailableData, breadcrumbLabel, entityName } = config;

		try {
			console.log(`📦 [createLoad] Iniciando load para crear [${entityName}]`);

			// 1. Generar UUID único (server-side por seguridad)
			const dataWithUuid = {
				id: uuidv4(),
				...initialValues
			};

			console.log(`📦 [createLoad] UUID generado:`, dataWithUuid.id);

			// 2. Cargar listas disponibles (si se proporciona la función)
			let availableData = {};
			if (loadAvailableData) {
				console.log(`📦 [createLoad] Cargando datos disponibles para [${entityName}]...`);
				availableData = await loadAvailableData(fetch);
				console.log(`✅ [createLoad] Datos cargados:`, Object.keys(availableData));
			}

			// 3. Inicializar formulario con valores por defecto + UUID
			const form = await superValidate(dataWithUuid, schema);
			console.log(`📦 [createLoad] Formulario inicializado`);

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
