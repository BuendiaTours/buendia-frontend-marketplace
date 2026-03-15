/**
 * Server load and action for the tag creation page.
 * Uses generic factories — breadcrumbs and entity name are handled by the page component.
 */
import { createCreateLoad } from '$lib/server/backoffice/createLoad';
import { createCreateAction } from '$lib/server/backoffice/createAction';
import { tagFormSchema, type TagFormSchema } from '../schemas/tag-form.schema';
import { TAG_REQUEST } from '$core/tags/requests';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = createCreateLoad<TagFormSchema>({
	schema: zod(tagFormSchema),
	initialValues: {
		name: ''
	}
});

export const actions: Actions = {
	default: createCreateAction({
		basePath: `${BACKOFFICE_PREFIX}/tags`,
		schema: zod(tagFormSchema),
		createFn: TAG_REQUEST.create,
		redirectToList: true,
		transformData: ({ id, ...rest }) => ({ id, ...rest })
	})
};
