import type { PageServerLoad } from './$types';
import { getQueryCount, getQueryLog } from '$core/_shared/client';

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
