import { createCreateLoad } from '$lib/server/backoffice/createLoad';
import { createCreateAction } from '$lib/server/backoffice/createAction';
import { attractionFormSchema } from '../schemas/attraction-form.schema';
import { ATTRACTION_REQUEST } from '$core/attractions/requests';
import { DESTINATION_REQUEST } from '$core/destinations/requests';
import { zod } from 'sveltekit-superforms/adapters';
import { AttractionStatus } from '$core/attractions/enums';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import type { PageServerLoad, Actions } from './$types';

/**
 * Load function para crear nueva atracción
 *
 * Usa createCreateLoad() factory que maneja:
 * - Generación de UUID único
 * - Carga de listas disponibles (destinations)
 * - Inicialización del formulario con valores por defecto
 * - Generación de breadcrumbs
 */
export const load: PageServerLoad = createCreateLoad({
	schema: zod(attractionFormSchema),
	initialValues: {
		// Campos básicos
		name: '',
		slug: '',
		status: AttractionStatus.DRAFT,

		// Descripciones
		description: '',
		descriptionLong: '',

		// Imágenes
		photoUrl: '',
		photoUrlHero: '',

		// Ubicación
		postalAddress: '',
		location: null,

		// Relaciones
		destinations: []
	},
	loadAvailableData: async (fetch) => ({
		availableDestinations: (await DESTINATION_REQUEST.findByCriteria(fetch)).data || []
	}),
	breadcrumbLabel: 'Nueva atracción',
	entityName: 'atracción'
});

/**
 * Action para crear una nueva atracción
 *
 * Usa createCreateAction() factory que maneja:
 * - Validación del formulario
 * - Llamada a api.attractions.create()
 * - Manejo de errores con mensajes personalizados
 * - Flash messages
 * - Redirección a la página de edición
 */
export const actions: Actions = {
	default: createCreateAction({
		basePath: `${BACKOFFICE_PREFIX}/attractions`,
		schema: zod(attractionFormSchema),
		createFn: ATTRACTION_REQUEST.create,
		entityName: 'atracción',
		redirectToEdit: true
	})
};
