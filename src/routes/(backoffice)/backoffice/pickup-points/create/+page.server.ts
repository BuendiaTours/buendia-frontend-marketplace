/**
 * Server load and action for the pickup point creation page.
 * Supports `returnTo` query param: when present, redirects back to the
 * originating page with `addPickupPointId` so it can auto-add the new point.
 */
import { v4 as uuidv4 } from 'uuid';
import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import {
	pickupPointFormSchema,
	type PickupPointFormSchema
} from '../schemas/pickup-point-form.schema';
import { PICKUP_POINT_REQUEST } from '$core/pickup-points/requests';
import { ApiError } from '$core/_shared/errors';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { setFlashMessage } from '$lib/server/backoffice/flashMessages';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const form = await superValidate(
		{
			id: uuidv4(),
			name: '',
			address: '',
			city: '',
			postCode: '',
			countryCode: '',
			location: null
		},
		zod(pickupPointFormSchema),
		{ errors: false }
	);

	return {
		form,
		breadcrumbs: [],
		returnTo: url.searchParams.get('returnTo')
	};
};

export const actions: Actions = {
	default: async ({ request, fetch, cookies, url }) => {
		const form = await superValidate(request, zod(pickupPointFormSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { id, location, address, city, postCode, countryCode, ...rest } = form.data;

		try {
			await PICKUP_POINT_REQUEST.create(fetch, {
				...rest,
				id,
				address: address || null,
				city: city || null,
				postCode: postCode || null,
				countryCode: countryCode || null,
				coords:
					location != null
						? { latitude: location.coordinates[1], longitude: location.coordinates[0] }
						: null
			});

			setFlashMessage(cookies, {
				type: 'success',
				message: 'Pickup point creado correctamente.',
				code: 'create.success'
			});

			await new Promise((resolve) => setTimeout(resolve, 500));

			const returnTo = url.searchParams.get('returnTo');
			if (returnTo) {
				const returnUrl = new URL(returnTo, url.origin);
				returnUrl.searchParams.set('addPickupPointId', id);
				throw redirect(303, returnUrl.pathname + returnUrl.search);
			}

			throw redirect(303, `${BACKOFFICE_PREFIX}/pickup-points`);
		} catch (err) {
			if (isRedirect(err)) throw err;

			if (err instanceof ApiError) {
				return fail(err.status || 500, { form });
			}
			return fail(503, { form });
		}
	}
};
