import type { PageServerLoad } from './$types';

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
	// Ya no necesitamos escanear el directorio /api/
	// Los proxies han sido reemplazados por Remote Functions
	return {};
};
