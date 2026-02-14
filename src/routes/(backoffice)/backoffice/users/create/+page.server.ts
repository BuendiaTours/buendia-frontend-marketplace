import { createCreateLoad } from '$lib/server/backoffice/createLoad';
import { createCreateAction } from '$lib/server/backoffice/createAction';
import { userFormSchema } from '../user-form.schema';
import { api } from '$lib/api/index';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { UserStatus } from '$core/users/enums';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = createCreateLoad({
	schema: zod(userFormSchema),
	initialValues: {
		name: '',
		email: '',
		phone: '',
		kind: undefined,
		status: UserStatus.ACTIVE,
		roles: []
	},
	breadcrumbLabel: 'Nuevo usuario',
	entityName: 'usuario'
});

export const actions: Actions = {
	default: createCreateAction({
		basePath: `${BACKOFFICE_PREFIX}/users`,
		schema: zod(userFormSchema),
		createFn: api.users.create,
		entityName: 'usuario',
		redirectToList: true
	})
};
