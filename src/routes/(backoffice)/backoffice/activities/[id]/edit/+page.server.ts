/**
 * Server load and actions for the activity edit (General) tab.
 * Includes form data, classification (categories + tags), and update/delete actions.
 */
import * as m from '$paraglide/messages';
import { v4 as uuidv4 } from 'uuid';
import { ACTIVITY_REQUEST } from '$core/activities/requests';
import { CATEGORY_REQUEST } from '$core/categories/requests';
import { TAG_REQUEST, TAG_RELATIONSHIP_REQUEST } from '$core/tags/requests';
import { FREE_TOUR_REQUEST } from '$core/free-tours/requests';
import { CategoryStatus } from '$core/categories/enums';
import { TagRelationshipKind } from '$core/tags/enums';
import { ApiError } from '$core/_shared/errors';
import { FREE_TOUR_ROUTES } from '$lib/config/routes/backoffice/freeTours';
import { activityEditSchema } from '../../schemas/activity-edit.schema';
import {
	ACTIVITY_INCLUDED_OPTIONS,
	ACTIVITY_EXCLUDED_OPTIONS,
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
			included: (activity.included ?? []).map((i) => {
				const option = ACTIVITY_INCLUDED_OPTIONS.find((o) => o.id === i);
				return { id: i, name: option?.name ?? i };
			}),
			excluded: (activity.excluded ?? []).map((e) => {
				const option = ACTIVITY_EXCLUDED_OPTIONS.find((o) => o.id === e);
				return { id: e, name: option?.name ?? e };
			}),
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
		transformData: ({
			id,
			supplierId,
			included,
			excluded,
			restrictions,
			notSuitableFor,
			...rest
		}) => ({
			...rest,
			included: (included ?? []).map((i) => i.id),
			excluded: (excluded ?? []).map((e) => e.id),
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
	},
	markAsReady: async ({ fetch, params, cookies }) => {
		try {
			await ACTIVITY_REQUEST.promoteToPendingGroup(fetch, params.id);
			setFlashMessage(cookies, {
				type: 'success',
				message: m.activities_markAsReadySuccess(),
				code: 'markAsReady.success'
			});
			await new Promise((resolve) => setTimeout(resolve, 500));
			throw redirect(303, `${BACKOFFICE_PREFIX}/activities/${params.id}/edit`);
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err && err.status === 303) throw err;

			console.error('[activities/markAsReady] error', err);
			setFlashMessage(cookies, {
				type: 'error',
				message: m.activities_markAsReadyErrorGeneric(),
				code: 'markAsReady.error'
			});
			throw redirect(303, `${BACKOFFICE_PREFIX}/activities/${params.id}/edit`);
		}
	},
	createGrouping: async ({ fetch, params, cookies }) => {
		const freeTourId = uuidv4();
		const entryId = uuidv4();

		try {
			await FREE_TOUR_REQUEST.createFromActivity(fetch, params.id, {
				id: freeTourId,
				entryId
			});

			// Wait for the free tour projection to be ready + the editorial fields that the
			// copy-from-activity handler populates asynchronously (images, contentBlocks, etc.).
			const DELAY_MS = 600;
			let projectionReady = false;
			for (let attempt = 0; attempt < 5; attempt++) {
				await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
				try {
					const freeTour = await FREE_TOUR_REQUEST.findById(fetch, freeTourId);
					if (
						Array.isArray(freeTour.categoryIds) &&
						Array.isArray(freeTour.destinationIds) &&
						Array.isArray(freeTour.contentBlocks) &&
						Array.isArray(freeTour.images)
					) {
						projectionReady = true;
						break;
					}
				} catch {
					// keep polling
				}
			}
			// Safety margin so that any in-flight copy events commit before we navigate.
			await new Promise((resolve) => setTimeout(resolve, DELAY_MS));

			if (!projectionReady) {
				setFlashMessage(cookies, {
					type: 'warning',
					message: m.activities_createGroupingErrorNotFound(),
					code: 'createGrouping.notReady'
				});
				throw redirect(303, `${BACKOFFICE_PREFIX}/activities/${params.id}/edit`);
			}

			setFlashMessage(cookies, {
				type: 'success',
				message: m.activities_createGroupingSuccess(),
				code: 'createGrouping.success'
			});
			throw redirect(303, FREE_TOUR_ROUTES.edit(freeTourId));
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err && err.status === 303) throw err;

			console.error('[activities/createGrouping] error', err);
			setFlashMessage(cookies, {
				type: 'error',
				message: m.activities_createGroupingErrorGeneric(),
				code: 'createGrouping.error'
			});
			throw redirect(303, `${BACKOFFICE_PREFIX}/activities/${params.id}/edit`);
		}
	},
	joinExistingFreeTour: async ({ fetch, params, request, cookies }) => {
		const formData = await request.formData();
		const freeTourId = (formData.get('freeTourId') as string | null)?.trim();

		if (!freeTourId) {
			setFlashMessage(cookies, {
				type: 'error',
				message: m.activities_joinFreeTourErrorMissing(),
				code: 'joinFreeTour.missing'
			});
			throw redirect(303, `${BACKOFFICE_PREFIX}/activities/${params.id}/edit`);
		}

		try {
			// Fetch existing entries to compute next priority.
			const freeTour = await FREE_TOUR_REQUEST.findById(fetch, freeTourId);
			const entries = freeTour.entries ?? [];
			const nextPriority =
				entries.length === 0 ? 1 : Math.max(...entries.map((e) => e.priority)) + 1;

			await FREE_TOUR_REQUEST.addEntry(fetch, freeTourId, {
				id: uuidv4(),
				activityId: params.id,
				priority: nextPriority
			});

			setFlashMessage(cookies, {
				type: 'success',
				message: m.activities_joinFreeTourSuccess(),
				code: 'joinFreeTour.success'
			});
			// Give CQRS a moment before redirecting to the free tour edit.
			await new Promise((resolve) => setTimeout(resolve, 500));
			throw redirect(303, FREE_TOUR_ROUTES.edit(freeTourId));
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err && err.status === 303) throw err;

			console.error('[activities/joinExistingFreeTour] error', err);
			setFlashMessage(cookies, {
				type: 'error',
				message: m.activities_joinFreeTourErrorGeneric(),
				code: 'joinFreeTour.error'
			});
			throw redirect(303, `${BACKOFFICE_PREFIX}/activities/${params.id}/edit`);
		}
	}
};
