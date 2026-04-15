/**
 * Server load and actions for the free tour edit page.
 * Fetches the free tour by ID, available relations, and wires up update/delete/changeStatus actions.
 */
import * as m from '$paraglide/messages';
import { FREE_TOUR_REQUEST } from '$core/free-tours/requests';
import { CATEGORY_REQUEST } from '$core/categories/requests';
import { LOCATION_REQUEST } from '$core/locations/requests';
import { ACTIVITY_REQUEST } from '$core/activities/requests';
import { FreeTourStatus } from '$core/free-tours/enums';
import { ActivityKind } from '$core/activities/enums';
import { ApiError } from '$core/_shared/errors';
import { freeTourFormSchema } from '../../schemas/free-tour-form.schema';
import { error, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { createUpdateAction } from '$lib/server/backoffice/updateAction';
import { createDeleteAction } from '$lib/server/backoffice/deleteAction';
import { setFlashMessage } from '$lib/server/backoffice/flashMessages';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const [freeTour, categoriesRes, locationsRes, activitiesRes] = await Promise.all([
			FREE_TOUR_REQUEST.findById(fetch, params.id),
			CATEGORY_REQUEST.findByCriteria(fetch, { limit: 200 }),
			LOCATION_REQUEST.findByCriteria(fetch, { limit: 200 }),
			ACTIVITY_REQUEST.findByCriteria(fetch, { kind: ActivityKind.FREE_TOUR, limit: 200 })
		]);

		const availableCategories = categoriesRes.data.map((c) => ({ id: c.id, name: c.name }));
		const availableDestinations = locationsRes.data.map((l) => ({ id: l.id, name: l.name }));

		const form = await superValidate(
			{
				id: freeTour.id,
				title: freeTour.title,
				slug: freeTour.slug,
				descriptionShort: freeTour.descriptionShort ?? '',
				descriptionFull: freeTour.descriptionFull ?? '',
				categories: freeTour.categoryIds
					.map((cid) => availableCategories.find((c) => c.id === cid))
					.filter(Boolean) as { id: string; name: string }[],
				destinations: freeTour.destinationIds
					.map((did) => availableDestinations.find((d) => d.id === did))
					.filter(Boolean) as { id: string; name: string }[]
			},
			zod(freeTourFormSchema)
		);

		return {
			freeTour,
			form,
			availableCategories,
			availableDestinations,
			availableActivities: activitiesRes.data.map((a) => ({ id: a.id, title: a.title }))
		};
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500);
		}
		throw error(503);
	}
};

export const actions: Actions = {
	update: createUpdateAction({
		basePath: `${BACKOFFICE_PREFIX}/free-tours`,
		schema: zod(freeTourFormSchema),
		updateFn: FREE_TOUR_REQUEST.update,
		redirectToList: true,
		paramName: 'id',
		transformData: ({ id, slug, ...rest }) => ({
			title: rest.title,
			descriptionShort: rest.descriptionShort,
			descriptionFull: rest.descriptionFull,
			categoryIds: (rest.categories ?? []).map((c) => c.id),
			destinationIds: (rest.destinations ?? []).map((d) => d.id)
		})
	}),
	delete: createDeleteAction({
		basePath: `${BACKOFFICE_PREFIX}/free-tours`,
		deleteFn: FREE_TOUR_REQUEST.delete
	}),
	changeStatus: async ({ fetch, params, request, cookies }) => {
		const formData = await request.formData();
		const action = formData.get('action') as string;

		try {
			const newStatus =
				action === 'publish' ? FreeTourStatus.PUBLISHED : FreeTourStatus.UNPUBLISHED;

			await FREE_TOUR_REQUEST.update(fetch, params.id, { status: newStatus });

			setFlashMessage(cookies, {
				type: 'success',
				message:
					action === 'publish' ? m.freeTours_publishSuccess() : m.freeTours_unpublishSuccess(),
				code: 'status.success'
			});

			await new Promise((resolve) => setTimeout(resolve, 500));
			throw redirect(303, `${BACKOFFICE_PREFIX}/free-tours/${params.id}/edit`);
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err && err.status === 303) throw err;

			console.error('[free-tours/changeStatus] Error:', err);
			setFlashMessage(cookies, {
				type: 'error',
				message: m.freeTours_statusError(),
				code: 'status.error'
			});

			throw redirect(303, `${BACKOFFICE_PREFIX}/free-tours/${params.id}/edit`);
		}
	}
};
