/**
 * Server load and actions for the activity edit page.
 * Fetches the activity by ID, populates the form, and wires up update/delete actions.
 */
import { ACTIVITY_REQUEST } from '$core/activities/requests';
import { ApiError } from '$core/_shared/errors';
import { activityEditSchema } from '../../schemas/activity-edit.schema';
import {
	ACTIVITY_RESTRICTION_OPTIONS,
	ACTIVITY_NOT_SUITABLE_FOR_OPTIONS
} from '$lib/labels/activities';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { createUpdateAction } from '$lib/server/backoffice/updateAction';
import { createDeleteAction } from '$lib/server/backoffice/deleteAction';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const activity = await ACTIVITY_REQUEST.findById(fetch, params.id);

		const form = await superValidate(
			{
				id: activity.id,
				title: activity.title ?? '',
				slug: activity.slug ?? '',
				supplierId: activity.supplierId ?? '',
				codeRef: activity.codeRef ?? '',
				status: activity.status,
				kind: activity.kind,
				dateMode: activity.dateMode,
				guideKind: activity.guideKind,
				descriptionShort: activity.descriptionShort ?? '',
				descriptionFull: activity.descriptionFull ?? '',
				infoImportant: activity.infoImportant ?? '',
				phoneContact: activity.phoneContact ?? '',
				transportKind: activity.transportKind,
				transportLocation: activity.transportLocation,
				petsAllowed: activity.petsAllowed?.allowed,
				petsAllowedDescription: activity.petsAllowed?.description ?? '',
				voucherInfo: activity.voucherInfo ?? '',
				restrictions: (activity.restrictions ?? []).map((r) => {
					const option = ACTIVITY_RESTRICTION_OPTIONS.find((o) => o.id === r);
					return { id: r, name: option?.name ?? r };
				}),
				notSuitableFor: (activity.notSuitableFor ?? []).map((n) => {
					const option = ACTIVITY_NOT_SUITABLE_FOR_OPTIONS.find((o) => o.id === n);
					return { id: n, name: option?.name ?? n };
				}),
				included: activity.included ?? [],
				excluded: activity.excluded ?? [],
				itemsToBring: activity.itemsToBring ?? [],
				willDoing: activity.willDoing ?? []
			},
			zod(activityEditSchema)
		);

		return { activity, form };
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500);
		}
		throw error(503);
	}
};

export const actions: Actions = {
	update: createUpdateAction({
		basePath: `${BACKOFFICE_PREFIX}/activities`,
		schema: zod(activityEditSchema),
		updateFn: ACTIVITY_REQUEST.update,
		redirectToList: true,
		paramName: 'id',
		transformData: ({ id, supplierId, restrictions, notSuitableFor, ...rest }) => ({
			...rest,
			restrictions: (restrictions ?? []).map((r) => r.id),
			notSuitableFor: (notSuitableFor ?? []).map((n) => n.id)
		})
	}),
	delete: createDeleteAction({
		basePath: `${BACKOFFICE_PREFIX}/activities`,
		deleteFn: ACTIVITY_REQUEST.delete
	})
};
