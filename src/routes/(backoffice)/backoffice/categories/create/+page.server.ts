/**
 * Server load and action for the category creation page.
 * Uses generic factories — breadcrumbs and entity name are handled by the page component.
 */
import { createCreateLoad } from '$lib/server/backoffice/createLoad';
import { createCreateAction } from '$lib/server/backoffice/createAction';
import { categoryFormSchema, type CategoryFormSchema } from '../schemas/category-form.schema';
import { CATEGORY_REQUEST } from '$core/categories/requests';
import { zod } from 'sveltekit-superforms/adapters';
import { CategoryStatus } from '$core/categories/enums';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = createCreateLoad<CategoryFormSchema>({
	schema: zod(categoryFormSchema),
	initialValues: {
		name: '',
		status: CategoryStatus.DRAFT,
		description: ''
	}
});

export const actions: Actions = {
	default: createCreateAction({
		basePath: `${BACKOFFICE_PREFIX}/categories`,
		schema: zod(categoryFormSchema),
		createFn: CATEGORY_REQUEST.create,
		redirectToList: true,
		transformData: ({ id, ...rest }) => ({ id, ...rest })
	})
};
