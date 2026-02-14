import type { PageServerLoad } from './$types';
import { getQueryCount, getQueryLog } from '$lib/api/index';

/**
 * API Catalog - Load Function
 */
export const load: PageServerLoad = async () => {
	return {
		// Debug throttling: queries realizadas en esta sesión del servidor
		queryCount: getQueryCount(),
		queryLog: getQueryLog()
	};
};
