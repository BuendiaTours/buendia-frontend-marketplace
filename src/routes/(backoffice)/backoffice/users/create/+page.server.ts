/**
 * Server load and action for the user creation page.
 * All users created from backoffice are ADMIN kind.
 */
import { createCreateLoad } from '$lib/server/backoffice/createLoad';
import { createCreateAction } from '$lib/server/backoffice/createAction';
import { userFormSchema, type UserFormSchema } from '../schemas/user-form.schema';
import { USER_REQUEST } from '$core/users/requests';
import { zod } from 'sveltekit-superforms/adapters';
import { UserKind } from '$core/users/enums';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = createCreateLoad<UserFormSchema>({
	schema: zod(userFormSchema),
	initialValues: {
		name: '',
		email: '',
		phone: '',
		roles: []
	}
});

export const actions: Actions = {
	default: createCreateAction({
		basePath: `${BACKOFFICE_PREFIX}/users`,
		schema: zod(userFormSchema),
		createFn: USER_REQUEST.create,
		redirectToList: true,
		transformData: ({ id, status, ...rest }) => ({ id, kind: UserKind.ADMIN, ...rest })
	})
};
