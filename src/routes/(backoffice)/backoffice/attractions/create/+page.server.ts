import { createCreateLoad } from '$lib/server/createLoad';
import { createCreateAction } from '$lib/server/createAction';
import { attractionFormSchema } from '../attraction-form.schema';
import { api } from '$lib/api/index';
import { zod } from 'sveltekit-superforms/adapters';
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
		status: 'DRAFT',

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
		availableDestinations: (await api.destinations.getAll(fetch)).data || []
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
		createFn: api.attractions.create,
		entityName: 'atracción',
		redirectToEdit: true
	})
};
