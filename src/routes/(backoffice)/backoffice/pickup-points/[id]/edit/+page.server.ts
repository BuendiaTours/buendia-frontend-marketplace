/**
 * Server load and actions for the pickup point edit page.
 */
import { PICKUP_POINT_REQUEST } from '$core/pickup-points/requests';
import { ApiError } from '$core/_shared/errors';
import { pickupPointFormSchema } from '../../schemas/pickup-point-form.schema';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { createUpdateAction } from '$lib/server/backoffice/updateAction';
import { createDeleteAction } from '$lib/server/backoffice/deleteAction';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const pickupPoint = await PICKUP_POINT_REQUEST.findById(fetch, params.id);

		const form = await superValidate(
			{
				id: pickupPoint.id,
				name: pickupPoint.name,
				address: pickupPoint.address ?? '',
				city: pickupPoint.city ?? '',
				postCode: pickupPoint.postCode ?? '',
				countryCode: pickupPoint.countryCode ?? '',
				location:
					pickupPoint.coords != null
						? {
								type: 'Point' as const,
								coordinates: [pickupPoint.coords.longitude, pickupPoint.coords.latitude] as [
									number,
									number
								]
							}
						: null
			},
			zod(pickupPointFormSchema)
		);

		return { pickupPoint, form };
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500);
		}
		throw error(503);
	}
};

export const actions: Actions = {
	update: createUpdateAction({
		basePath: `${BACKOFFICE_PREFIX}/pickup-points`,
		schema: zod(pickupPointFormSchema),
		updateFn: PICKUP_POINT_REQUEST.update,
		redirectToList: true,
		paramName: 'id',
		transformData: ({ id, location, address, city, postCode, countryCode, ...rest }) => ({
			...rest,
			address: address || null,
			city: city || null,
			postCode: postCode || null,
			countryCode: countryCode || null,
			coords:
				location != null
					? { latitude: location.coordinates[1], longitude: location.coordinates[0] }
					: null
		})
	}),
	delete: createDeleteAction({
		basePath: `${BACKOFFICE_PREFIX}/pickup-points`,
		deleteFn: PICKUP_POINT_REQUEST.delete
	})
};
