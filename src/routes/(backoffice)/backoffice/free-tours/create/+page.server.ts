/**
 * Server load and action for the free tour creation page.
 * Creates an activity with kind=FREE_TOUR in DRAFT status and redirects to the
 * activity edit page, where the admin can finish filling it in and then trigger
 * the "Crear agrupación" action (status → PENDING_GROUP) to materialize the FreeTour.
 */
import { createCreateLoad } from '$lib/server/backoffice/createLoad';
import { createCreateAction } from '$lib/server/backoffice/createAction';
import {
	activityCreateSchema,
	type ActivityCreateSchema
} from '../../activities/schemas/activity-create.schema';
import { ACTIVITY_REQUEST } from '$core/activities/requests';
import { ActivityDateMode, ActivityGuideKind, ActivityKind } from '$core/activities/enums';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = createCreateLoad<ActivityCreateSchema>({
	schema: zod(activityCreateSchema),
	initialValues: {
		title: '',
		slug: '',
		supplierId: '',
		kind: ActivityKind.FREE_TOUR,
		guideKind: ActivityGuideKind.AUTO,
		dateMode: ActivityDateMode.DATE_AND_TIME,
		descriptionFull: '',
		codeRef: '',
		infoImportant: '',
		phoneContact: ''
	}
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
			guideKind,
			infoImportant,
			phoneContact
		}) => ({
			id,
			title,
			slug,
			supplierId,
			descriptionFull,
			guideKind,
			kind: ActivityKind.FREE_TOUR,
			...(codeRef ? { codeRef } : {}),
			...(dateMode ? { dateMode } : {}),
			...(infoImportant ? { infoImportant } : {}),
			...(phoneContact ? { phoneContact } : {})
		})
	})
};
