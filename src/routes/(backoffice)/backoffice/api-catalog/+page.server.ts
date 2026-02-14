import type { PageServerLoad } from './$types';
import { getQueryCount, getQueryLog } from '$lib/api/index';

/**
 * API Catalog - Load Function
 *
 * Este load function ya no necesita escanear endpoints proxy
 * ya que han sido reemplazados por Remote Functions.
 *
 * Las Remote Functions están documentadas en:
 * - src/lib/api/common.remote.ts
 */
export const load: PageServerLoad = async () => {
	return {
		// Debug throttling: queries realizadas en esta sesión del servidor
		queryCount: getQueryCount(),
		queryLog: getQueryLog()
	};
};
