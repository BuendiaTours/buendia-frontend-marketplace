import { createCreateLoad } from '$lib/server/createLoad';
import { createCreateAction } from '$lib/server/createAction';
import { activityFormSchema } from '../activity-form.schema';
import { api } from '$lib/api/index';
import { apiConfig } from '$lib/api/config';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import type { PageServerLoad, Actions } from './$types';

/**
 * Load function para crear nueva actividad
 *
 * Usa createCreateLoad() factory que maneja:
 * - Generación de UUID único
 * - Carga de listas disponibles (tags, categories, etc.)
 * - Inicialización del formulario con valores por defecto
 * - Generación de breadcrumbs
 */
export const load: PageServerLoad = createCreateLoad({
	schema: zod(activityFormSchema),
	initialValues: {
		// Campos básicos
		title: '',
		slug: '',
		codeRef: '',

		// Descripciones
		descriptionFull: '',
		descriptionShort: '',
		infoImportant: '',

		// Estado y tipos
		status: 'DRAFT',
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
	loadAvailableData: async (fetch) => ({
		availableTags: await fetch(`${apiConfig.baseURL}/tags`).then((res) => res.json()),
		availableCategories: await api.categories.getAll(fetch),
		availableAttractions: (await api.attractions.getAll(fetch)).data || [],
		availableDestinations: (await api.destinations.getAll(fetch)).data || [],
		availableDistributives: await api.distributives.getAll(fetch)
	}),
	breadcrumbLabel: 'Nueva actividad',
	entityName: 'actividad'
});

/**
 * Action para crear una nueva actividad
 *
 * Usa createCreateAction() factory que maneja:
 * - Validación del formulario
 * - Llamada a api.activities.create()
 * - Manejo de errores con mensajes personalizados
 * - Flash messages
 * - Redirección a la página de edición
 */
export const actions: Actions = {
	default: createCreateAction({
		basePath: `${BACKOFFICE_PREFIX}/activities`,
		schema: zod(activityFormSchema),
		createFn: (fetch, data) => api.activities.create(fetch, data as any),
		entityName: 'actividad',
		redirectToEdit: true
	})
};
