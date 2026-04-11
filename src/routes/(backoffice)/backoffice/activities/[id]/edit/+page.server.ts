/**
 * Server load and actions for the activity edit (General) tab.
 * Includes form data, classification (categories + tags), and update/delete actions.
 */
import * as m from '$paraglide/messages';
import { ACTIVITY_REQUEST } from '$core/activities/requests';
import { CATEGORY_REQUEST } from '$core/categories/requests';
import { TAG_REQUEST, TAG_RELATIONSHIP_REQUEST } from '$core/tags/requests';
import { CategoryStatus } from '$core/categories/enums';
import { TagRelationshipKind } from '$core/tags/enums';
import { ApiError } from '$core/_shared/errors';
import { activityEditSchema } from '../../schemas/activity-edit.schema';
import {
	ACTIVITY_RESTRICTION_OPTIONS,
	ACTIVITY_NOT_SUITABLE_FOR_OPTIONS
} from '$lib/labels/activities';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { createUpdateAction } from '$lib/server/backoffice/updateAction';
import { createDeleteAction } from '$lib/server/backoffice/deleteAction';
import { setFlashMessage } from '$lib/server/backoffice/flashMessages';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ fetch, parent }) => {
	const { activity } = await parent();

	const [categoriesResponse, tagsResponse, tagRelationshipsResponse] = await Promise.all([
		CATEGORY_REQUEST.findByCriteria(fetch, {
			status: CategoryStatus.ACTIVE,
			limit: 200
		}),
		TAG_REQUEST.findByCriteria(fetch, { pageSize: 200 }),
		TAG_RELATIONSHIP_REQUEST.findByCriteria(fetch, {
			entityId: activity.id,
			kind: TagRelationshipKind.ACTIVITY,
			limit: 200
		})
	]);

	const availableCategories = categoriesResponse.data.map((c) => ({ id: c.id, name: c.name }));
	const availableTags = tagsResponse.data.map((t) => ({ id: t.id, name: t.name }));
	const tagMap = new Map(availableTags.map((t) => [t.id, t.name]));
	const activityTags = (tagRelationshipsResponse.data ?? []).map((rel) => ({
		relationshipId: rel.id,
		tagId: rel.tagId,
		name: tagMap.get(rel.tagId) ?? rel.tagId
	}));

	const form = await superValidate(
		{
			id: activity.id,
			title: activity.title ?? '',
			slug: activity.slug ?? '',
			supplierId: activity.supplier?.id ?? '',
			kind: activity.kind,
			dateMode: activity.dateMode,
			guideKind: activity.guideKind,
			descriptionFull: activity.descriptionFull ?? '',
			difficult: activity.difficult ?? 2,
			infoImportant: activity.infoImportant ?? '',
			phoneContact: activity.phoneContact ?? '',
			transportKind: activity.transportKind,
			transportLocation: activity.transportLocation,
			petsAllowed: activity.petsAllowed?.allowed,
			petsAllowedDescription: activity.petsAllowed?.description ?? '',
			supplierTip: activity.supplierTip ?? '',
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

	return { form, availableCategories, availableTags, activityTags };
};

function getPublishErrorMessage(errorCode: string): string | undefined {
	const messages: Record<string, () => string> = {
		ACTIVITY_NOT_PUBLISHABLE: m.activities_publishErrorNotPublishable,
		ACTIVITY_MISSING_DESTINATION: m.activities_publishErrorMissingDestination,
		ACTIVITY_MISSING_PUBLISHED_OPTION: m.activities_publishErrorMissingOption,
		ACTIVITY_MISSING_CATEGORY: m.activities_publishErrorMissingCategory,
		ACTIVITY_MISSING_MEDIA: m.activities_publishErrorMissingMedia,
		ACTIVITY_NOT_UNPUBLISHABLE: m.activities_publishErrorNotUnpublishable
	};
	return messages[errorCode]?.();
}

export const actions: Actions = {
	update: createUpdateAction({
		basePath: `${BACKOFFICE_PREFIX}/activities`,
		schema: zod(activityEditSchema),
		updateFn: ACTIVITY_REQUEST.update,
		redirectToEdit: true,
		redirectDelayMs: 500,
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
	}),
	changeStatus: async ({ fetch, params, request, cookies }) => {
		const formData = await request.formData();
		const action = formData.get('action') as string;

		try {
			if (action === 'publish') {
				await ACTIVITY_REQUEST.publish(fetch, params.id);
				setFlashMessage(cookies, {
					type: 'success',
					message: m.activities_publishSuccess(),
					code: 'status.success'
				});
			} else {
				await ACTIVITY_REQUEST.unpublish(fetch, params.id);
				setFlashMessage(cookies, {
					type: 'success',
					message: m.activities_unpublishSuccess(),
					code: 'status.success'
				});
			}

			await new Promise((resolve) => setTimeout(resolve, 500));
			throw redirect(303, `${BACKOFFICE_PREFIX}/activities/${params.id}/edit`);
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err && err.status === 303) throw err;

			let errorMessage: string = m.activities_publishErrorGeneric();

			if (
				err instanceof ApiError &&
				err.data &&
				typeof err.data === 'object' &&
				'errorCode' in err.data
			) {
				const code = (err.data as { errorCode: string }).errorCode;
				errorMessage = getPublishErrorMessage(code) ?? errorMessage;
			}

			setFlashMessage(cookies, { type: 'error', message: errorMessage, code: 'status.error' });
			throw redirect(303, `${BACKOFFICE_PREFIX}/activities/${params.id}/edit`);
		}
	}
};
