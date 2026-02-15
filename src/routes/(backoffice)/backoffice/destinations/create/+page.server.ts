import { createCreateLoad } from '$lib/server/backoffice/createLoad';
import { createCreateAction } from '$lib/server/backoffice/createAction';
import { destinationFormSchema } from '../destination-form.schema';
import { DESTINATION_REQUEST } from '$core/destinations/requests';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import type { PageServerLoad, Actions } from './$types';

/**
 * Load function para crear nuevo destino
 *
 * Usa createCreateLoad() factory que maneja:
 * - Generación de UUID único
 * - Inicialización del formulario con valores por defecto
 * - Generación de breadcrumbs
 */
export const load: PageServerLoad = createCreateLoad({
	schema: zod(destinationFormSchema),
	initialValues: {
		// Campos básicos
		name: '',
		slug: '',
		kind: undefined,

		// Descripciones
		descriptionShort: '',

		// Imágenes
		photoUrlHero: ''
	},
	breadcrumbLabel: 'Nuevo destino',
	entityName: 'destino'
});

/**
 * Action para crear un nuevo destino
 *
 * Usa createCreateAction() factory que maneja:
 * - Validación del formulario
 * - Llamada a api.destinations.create()
 * - Manejo de errores con mensajes personalizados
 * - Flash messages
 * - Redirección a la página de edición
 */
export const actions: Actions = {
	default: createCreateAction({
		basePath: `${BACKOFFICE_PREFIX}/destinations`,
		schema: zod(destinationFormSchema),
		createFn: DESTINATION_REQUEST.create,
		entityName: 'destino',
		redirectToEdit: true
	})
};
