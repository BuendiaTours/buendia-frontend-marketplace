/**
 * Server load and actions for the distributive edit page.
 * Fetches the distributive by ID, populates the form, and wires up update/delete/changeStatus actions.
 */
import * as m from '$paraglide/messages';
import { DISTRIBUTIVE_REQUEST } from '$core/distributives/requests';
import { CATEGORY_REQUEST } from '$core/categories/requests';
import { ATTRACTION_REQUEST } from '$core/attractions/requests';
import { LOCATION_REQUEST } from '$core/locations/requests';
import { DistributiveStatus } from '$core/distributives/enums';
import { ApiError } from '$core/_shared/errors';
import { distributiveFormSchema } from '../../schemas/distributive-form.schema';
import { error, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { createUpdateAction } from '$lib/server/backoffice/updateAction';
import { createDeleteAction } from '$lib/server/backoffice/deleteAction';
import { setFlashMessage } from '$lib/server/backoffice/flashMessages';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ fetch, parent }) => {
	const { distributive } = await parent();

	try {
		const [categoriesRes, attractionsRes, locationsRes] = await Promise.all([
			CATEGORY_REQUEST.findByCriteria(fetch, { limit: 200 }),
			ATTRACTION_REQUEST.findByCriteria(fetch, { limit: 200 }),
			LOCATION_REQUEST.findByCriteria(fetch, { limit: 200 })
		]);

		const form = await superValidate(
			{
				id: distributive.id,
				name: distributive.name,
				slug: distributive.slug,
				featuredScore: 0
			},
			zod(distributiveFormSchema)
		);

		return {
			form,
			availableCategories: categoriesRes.data.map((c) => ({ id: c.id, name: c.name })),
			availableAttractions: attractionsRes.data.map((a) => ({ id: a.id, name: a.name })),
			availableLocations: locationsRes.data.map((l) => ({ id: l.id, name: l.name }))
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
		basePath: `${BACKOFFICE_PREFIX}/distributives`,
		schema: zod(distributiveFormSchema),
		updateFn: DISTRIBUTIVE_REQUEST.update,
		redirectToList: true,
		paramName: 'id',
		transformData: ({ id, slug, ...rest }) => ({
			name: rest.name,
			featuredScore: rest.featuredScore || undefined
		})
	}),
	delete: createDeleteAction({
		basePath: `${BACKOFFICE_PREFIX}/distributives`,
		deleteFn: DISTRIBUTIVE_REQUEST.delete
	}),
	changeStatus: async ({ fetch, params, request, cookies }) => {
		const formData = await request.formData();
		const action = formData.get('action') as string;

		try {
			const newStatus =
				action === 'publish' ? DistributiveStatus.PUBLISHED : DistributiveStatus.DRAFT;

			await DISTRIBUTIVE_REQUEST.update(fetch, params.id, { status: newStatus });

			setFlashMessage(cookies, {
				type: 'success',
				message:
					action === 'publish'
						? m.distributives_publishSuccess()
						: m.distributives_unpublishSuccess(),
				code: 'status.success'
			});

			await new Promise((resolve) => setTimeout(resolve, 500));
			throw redirect(303, `${BACKOFFICE_PREFIX}/distributives/${params.id}/edit`);
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err && err.status === 303) throw err;

			console.error('[distributives/changeStatus] Error:', err);
			setFlashMessage(cookies, {
				type: 'error',
				message: m.distributives_statusError(),
				code: 'status.error'
			});

			throw redirect(303, `${BACKOFFICE_PREFIX}/distributives/${params.id}/edit`);
		}
	}
};
