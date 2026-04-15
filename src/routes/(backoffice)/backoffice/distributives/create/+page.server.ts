/**
 * Server load and action for the distributive creation page.
 * Uses generic factories — breadcrumbs and entity name are handled by the page component.
 */
import { createCreateLoad } from '$lib/server/backoffice/createLoad';
import { createCreateAction } from '$lib/server/backoffice/createAction';
import {
	distributiveFormSchema,
	type DistributiveFormSchema
} from '../schemas/distributive-form.schema';
import { DISTRIBUTIVE_REQUEST } from '$core/distributives/requests';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = createCreateLoad<DistributiveFormSchema>({
	schema: zod(distributiveFormSchema),
	initialValues: {
		name: '',
		slug: '',
		featuredScore: 0
	}
});

export const actions: Actions = {
	default: createCreateAction({
		basePath: `${BACKOFFICE_PREFIX}/distributives`,
		schema: zod(distributiveFormSchema),
		createFn: DISTRIBUTIVE_REQUEST.create,
		redirectToList: true,
		transformData: (formData) => ({
			id: formData.id,
			name: formData.name,
			slug: formData.slug,
			featuredScore: formData.featuredScore || undefined
		})
	})
};
