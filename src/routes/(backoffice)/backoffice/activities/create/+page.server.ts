import { createCreateLoad } from '$lib/server/backoffice/createLoad';
import { createCreateAction } from '$lib/server/backoffice/createAction';
import { activityFormSchema } from '../activity-form.schema';
import { ACTIVITY_REQUEST } from '$core/activities/requests';
import { ATTRACTION_REQUEST } from '$core/attractions/requests';
import { CATEGORY_REQUEST } from '$core/categories/requests';
import { DESTINATION_REQUEST } from '$core/destinations/requests';
import { DISTRIBUTIVE_REQUEST } from '$core/distributives/requests';
import { TAG_REQUEST } from '$core/tags/requests';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { ActivityStatus } from '$core/activities/enums';
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
		status: ActivityStatus.DRAFT,
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
		availableTags: (await TAG_REQUEST.findByCriteria(fetch)).data || [],
		availableCategories: (await CATEGORY_REQUEST.findByCriteria(fetch)).data || [],
		availableAttractions: (await ATTRACTION_REQUEST.findByCriteria(fetch)).data || [],
		availableDestinations: (await DESTINATION_REQUEST.findByCriteria(fetch)).data || [],
		availableDistributives: (await DISTRIBUTIVE_REQUEST.findByCriteria(fetch)).data || []
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
		createFn: ACTIVITY_REQUEST.create,
		entityName: 'actividad',
		redirectToEdit: true
	})
};
