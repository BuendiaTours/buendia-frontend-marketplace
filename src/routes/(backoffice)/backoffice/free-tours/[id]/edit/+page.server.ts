/**
 * Server load and actions for the free tour edit (General) tab.
 * Loads form data and available relations from the parent layout's free tour.
 */
import * as m from '$paraglide/messages';
import { FREE_TOUR_REQUEST } from '$core/free-tours/requests';
import { CATEGORY_REQUEST } from '$core/categories/requests';
import { LOCATION_REQUEST } from '$core/locations/requests';
import { FreeTourStatus } from '$core/free-tours/enums';
import { ApiError } from '$core/_shared/errors';
import {
	FREE_TOUR_INCLUDED_OPTIONS,
	FREE_TOUR_EXCLUDED_OPTIONS,
	FREE_TOUR_RESTRICTION_OPTIONS
} from '$lib/labels/freeTours';
import { freeTourFormSchema } from '../../schemas/free-tour-form.schema';
import { error, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { createUpdateAction } from '$lib/server/backoffice/updateAction';
import { createDeleteAction } from '$lib/server/backoffice/deleteAction';
import { setFlashMessage } from '$lib/server/backoffice/flashMessages';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ parent, fetch }) => {
	const { freeTour } = await parent();

	const [categoriesRes, locationsRes] = await Promise.all([
		CATEGORY_REQUEST.findByCriteria(fetch, { limit: 200 }),
		LOCATION_REQUEST.findByCriteria(fetch, { limit: 200 })
	]);

	const availableCategories = categoriesRes.data.map((c) => ({ id: c.id, name: c.name }));
	const availableDestinations = locationsRes.data.map((l) => ({ id: l.id, name: l.name }));

	const form = await superValidate(
		{
			id: freeTour.id,
			title: freeTour.title ?? '',
			slug: freeTour.slug ?? '',
			descriptionShort: freeTour.descriptionShort ?? '',
			descriptionFull: freeTour.descriptionFull ?? '',
			categories: (freeTour.categoryIds ?? [])
				.map((cid) => availableCategories.find((c) => c.id === cid))
				.filter(Boolean) as { id: string; name: string }[],
			destinations: (freeTour.destinationIds ?? [])
				.map((did) => availableDestinations.find((d) => d.id === did))
				.filter(Boolean) as { id: string; name: string }[],
			included: (freeTour.included ?? []).map((i) => {
				const option = FREE_TOUR_INCLUDED_OPTIONS.find((o) => o.id === i);
				return { id: i, name: option?.name ?? i };
			}),
			excluded: (freeTour.excluded ?? []).map((e) => {
				const option = FREE_TOUR_EXCLUDED_OPTIONS.find((o) => o.id === e);
				return { id: e, name: option?.name ?? e };
			}),
			willDoing: freeTour.willDoing ?? [],
			restrictions: (freeTour.restrictions ?? []).map((r) => {
				const option = FREE_TOUR_RESTRICTION_OPTIONS.find((o) => o.id === r);
				return { id: r, name: option?.name ?? r };
			}),
			phoneContact: freeTour.phoneContact ?? '',
			voucherInfo: freeTour.voucherInfo ?? '',
			supplierTip: freeTour.supplierTip ?? ''
		},
		zod(freeTourFormSchema)
	);

	return { form, availableCategories, availableDestinations };
};

export const actions: Actions = {
	update: createUpdateAction({
		basePath: `${BACKOFFICE_PREFIX}/free-tours`,
		schema: zod(freeTourFormSchema),
		updateFn: FREE_TOUR_REQUEST.update,
		redirectToEdit: true,
		redirectDelayMs: 500,
		paramName: 'id',
		transformData: ({ id, slug, included, excluded, restrictions, ...rest }) => ({
			title: rest.title,
			descriptionShort: rest.descriptionShort,
			descriptionFull: rest.descriptionFull,
			categoryIds: (rest.categories ?? []).map((c) => c.id),
			destinationIds: (rest.destinations ?? []).map((d) => d.id),
			included: (included ?? []).map((i) => i.id),
			excluded: (excluded ?? []).map((e) => e.id),
			willDoing: rest.willDoing ?? [],
			restrictions: (restrictions ?? []).map((r) => r.id),
			phoneContact: rest.phoneContact || undefined,
			voucherInfo: rest.voucherInfo || undefined,
			supplierTip: rest.supplierTip || undefined
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
