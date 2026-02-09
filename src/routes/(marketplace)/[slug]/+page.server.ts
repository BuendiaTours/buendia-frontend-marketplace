import type { PageServerLoad } from './$types';
import { destinationsEndpoints } from '$lib/api/marketplace/endpoints/destinations';
import { activitiesEndpoints } from '$lib/api/marketplace/endpoints/activities';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, url, fetch }) => {
	const { slug } = params;
	const page = Number(url.searchParams.get('page')) || 1;
	const pageSize = Number(url.searchParams.get('pageSize')) || 10;

	try {
		// Fetch destination and activities in parallel
		const [destination, activitiesResult] = await Promise.all([
			destinationsEndpoints.getBySlug(fetch, slug),
			activitiesEndpoints.getAll(fetch, {
				destination: slug,
				page,
				pageSize
			})
		]);

		return {
			destination,
			activities: activitiesResult.data,
			pagination: activitiesResult.pagination
		};
	} catch (err) {
		console.error(`Error loading destination ${slug}:`, err);
		throw error(404, 'Destino no encontrado');
	}
};
