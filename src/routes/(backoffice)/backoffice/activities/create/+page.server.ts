/**
 * Server load and action for the activity creation page.
 * Uses generic factories — breadcrumbs and entity name are handled by the page component.
 */
import { createCreateLoad } from '$lib/server/backoffice/createLoad';
import { createCreateAction } from '$lib/server/backoffice/createAction';
import { activityFormSchema, type ActivityFormSchema } from '../schemas/activity-form.schema';
import { ACTIVITY_REQUEST } from '$core/activities/requests';
import { SUPPLIER_REQUEST } from '$core/suppliers/requests';
import { zod } from 'sveltekit-superforms/adapters';
import {
	ActivityDateMode,
	ActivityStatus,
	ActivityKind,
	ActivityGuideKind
} from '$core/activities/enums';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = createCreateLoad<
	ActivityFormSchema,
	{ availableSuppliers: Array<{ id: string; name: string }> }
>({
	schema: zod(activityFormSchema),
	initialValues: {
		title: '',
		slug: '',
		supplierId: '',
		codeRef: '',
		status: ActivityStatus.DRAFT,
		kind: ActivityKind.PAID_TOUR,
		dateMode: ActivityDateMode.DATE_AND_TIME,
		guideKind: ActivityGuideKind.AUTO,
		descriptionShort: '',
		descriptionFull: '',
		infoImportant: '',
		phoneContact: '',
		restrictions: [],
		notSuitableFor: [],
		included: [],
		excluded: [],
		itemsToBring: [],
		willDoing: []
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
		schema: zod(activityFormSchema),
		createFn: ACTIVITY_REQUEST.create,
		redirectToList: true,
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
