/**
 * Remote Functions - Common API Queries
 *
 * Este archivo contiene Remote Functions que reemplazan los endpoints proxy
 * internos (/api/*) que anteriormente ocultaban la API externa.
 *
 * Las Remote Functions permiten:
 * - Llamadas type-safe desde componentes al servidor
 * - Eliminación del boilerplate de endpoints proxy
 * - Ejecución siempre en el servidor (acceso a server-only modules)
 * - Retry automático y manejo de errores a través de apiClient
 *
 * Uso en componentes:
 * ```svelte
 * <script>
 *   import { getDestinationKinds } from '$lib/api/backoffice/common.remote';
 * </script>
 *
 * {#each await getDestinationKinds() as kind}
 *   <option value={kind.id}>{kind.name}</option>
 * {/each}
 * ```
 */

import { query } from '$app/server';
import { apiClient } from '../shared/client';

/**
 * Tipo para las opciones de selección que devuelven estos endpoints
 */
type SelectOption = {
	id: string;
	name: string;
	desc?: string;
};

/**
 * Obtiene los tipos de destino disponibles
 *
 * Reemplaza: GET /api/destination-kind
 * Endpoint externo: GET /destination-kind
 *
 * @returns Array de opciones con formato { id, name }
 * @example
 * // Uso en componente
 * const kinds = await getDestinationKinds();
 * // [{ id: "CITY", name: "Ciudad" }, ...]
 */
export const getDestinationKinds = query(async () => {
	const response = await apiClient.request<SelectOption[]>(fetch, '/destination-kind', {
		method: 'GET'
	});

	return response.data;
});

/**
 * Obtiene los estados disponibles para atracciones
 *
 * Reemplaza: GET /api/attraction-status
 * Endpoint externo: GET /attraction-status
 *
 * @returns Array de opciones con formato { id, name, desc? }
 * @example
 * // Uso en componente
 * const statuses = await getAttractionStatuses();
 * // [{ id: "ACTIVE", name: "Activa", desc: "..." }, ...]
 */
export const getAttractionStatuses = query(async () => {
	const response = await apiClient.request<SelectOption[]>(fetch, '/attraction-status', {
		method: 'GET'
	});

	return response.data;
});
