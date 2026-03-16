/**
 * Server load and action for the activity creation page.
 * Uses the minimal ActivityCreateDto schema — after creation, redirects to the edit page.
 */
import { createCreateLoad } from '$lib/server/backoffice/createLoad';
import { createCreateAction } from '$lib/server/backoffice/createAction';
import { activityCreateSchema, type ActivityCreateSchema } from '../schemas/activity-create.schema';
import { ACTIVITY_REQUEST } from '$core/activities/requests';
import { SUPPLIER_REQUEST } from '$core/suppliers/requests';
import { zod } from 'sveltekit-superforms/adapters';
import { ActivityDateMode, ActivityKind, ActivityGuideKind } from '$core/activities/enums';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = createCreateLoad<
	ActivityCreateSchema,
	{ availableSuppliers: Array<{ id: string; name: string }> }
>({
	schema: zod(activityCreateSchema),
	initialValues: {
		title: '',
		slug: '',
		supplierId: '',
		kind: ActivityKind.PAID_TOUR,
		guideKind: ActivityGuideKind.AUTO,
		dateMode: ActivityDateMode.DATE_AND_TIME,
		descriptionShort: '',
		descriptionFull: '',
		codeRef: '',
		infoImportant: '',
		phoneContact: ''
	},
	loadAvailableData: async (fetch) => ({
		availableSuppliers: (await SUPPLIER_REQUEST.findByCriteria(fetch)).data.map((s) => ({
			id: s.id,
			name: s.name
		}))
	})
});

export const actions: Actions = {
	default: createCreateAction({
		basePath: `${BACKOFFICE_PREFIX}/activities`,
		schema: zod(activityCreateSchema),
		createFn: ACTIVITY_REQUEST.create,
		redirectToEdit: true,
		redirectField: 'id',
		transformData: ({
			id,
			title,
			slug,
			supplierId,
			codeRef,
			dateMode,
			descriptionFull,
			descriptionShort,
			guideKind,
			infoImportant,
			kind,
			phoneContact
		}) => ({
			id,
			title,
			slug,
			supplierId,
			descriptionFull,
			descriptionShort,
			guideKind,
			kind,
			...(codeRef ? { codeRef } : {}),
			...(dateMode ? { dateMode } : {}),
			...(infoImportant ? { infoImportant } : {}),
			...(phoneContact ? { phoneContact } : {})
		})
	})
};
