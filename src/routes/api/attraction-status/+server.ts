/**
 * API Proxy Endpoint: Attraction Status
 *
 * Este endpoint actúa como proxy para ocultar la URL de la API externa.
 * Permite que componentes del cliente (como FilterSelectRemote) hagan peticiones
 * sin exponer la infraestructura interna.
 *
 * Endpoint externo: GET /attraction-status
 * Endpoint interno: GET /api/attraction-status
 *
 * Respuesta esperada:
 * [
 *   { id: "ACTIVE", name: "Activa", desc: "..." },
 *   { id: "DRAFT", name: "Borrador", desc: "..." },
 *   { id: "INACTIVE", name: "Inactiva", desc: "..." }
 * ]
 */

import { json } from '@sveltejs/kit';
import { apiClient } from '$lib/api/client';
import { ApiError } from '$lib/api/errors';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ fetch }) => {
	try {
		// Usar el apiClient existente que maneja:
		// - Retry automático
		// - Timeout
		// - Manejo de errores consistente
		// - Headers comunes
		const response = await apiClient.request(fetch, '/attraction-status');

		// Devolver los datos directamente
		return json(response.data);
	} catch (error) {
		// El ApiError ya viene con toda la información necesaria
		if (error instanceof ApiError) {
			return json(
				{
					error: error.message,
					type: error.type
				},
				{ status: error.status || 500 }
			);
		}

		// Error desconocido
		return json(
			{
				error: 'Internal server error',
				type: 'unknown'
			},
			{ status: 500 }
		);
	}
};
