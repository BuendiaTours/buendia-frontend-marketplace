/**
 * Server load and actions for the attraction edit page.
 * Fetches the attraction by ID, populates the form, and wires up update/delete actions.
 */
import { ATTRACTION_REQUEST } from '$core/attractions/requests';
import { LOCATION_REQUEST } from '$core/locations/requests';
import { ApiError } from '$core/_shared/errors';
import { attractionFormSchema } from '../../schemas/attraction-form.schema';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { createUpdateAction } from '$lib/server/backoffice/updateAction';
import { createDeleteAction } from '$lib/server/backoffice/deleteAction';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const [attraction, locationsResponse] = await Promise.all([
			ATTRACTION_REQUEST.findById(fetch, params.id),
			LOCATION_REQUEST.findByCriteria(fetch)
		]);

		const form = await superValidate(
			{
				id: attraction.id,
				name: attraction.name,
				description: attraction.description ?? '',
				descriptionLong: attraction.descriptionLong ?? '',
				postalAddress: attraction.postalAddress ?? '',
				destinations: attraction.locations.map((l) => ({ id: l.id, name: l.name })),
				location:
					attraction.coordinates != null
						? {
								type: 'Point' as const,
								coordinates: [
									attraction.coordinates.longitude,
									attraction.coordinates.latitude
								] as [number, number]
							}
						: null
			},
			zod(attractionFormSchema)
		);

		return {
			attraction,
			form,
			availableLocations: locationsResponse.data || []
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
		basePath: `${BACKOFFICE_PREFIX}/attractions`,
		schema: zod(attractionFormSchema),
		updateFn: ATTRACTION_REQUEST.update,
		redirectToList: true,
		paramName: 'id',
		transformData: ({ id, location, destinations, ...rest }) => ({
			...rest,
			latitude: location?.coordinates[1],
			longitude: location?.coordinates[0],
			locationIds: (destinations ?? []).map((d) => d.id)
		})
	}),
	delete: createDeleteAction({
		basePath: `${BACKOFFICE_PREFIX}/attractions`,
		deleteFn: ATTRACTION_REQUEST.delete
	})
};
