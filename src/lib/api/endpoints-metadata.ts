export const BASE_PATHS = {
	activities: '/activities',
	locations: '/locations',
	categories: '/categories',
	tags: '/tags',
	attractions: '/attractions',
	destinations: '/destinations',
	users: '/users',
	auth: '/auth'
} as const;

// Metadata structure for endpoints
export interface EndpointMetadata {
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	description: string;
	params?: string[];
}

// Endpoint definitions with metadata
export const API_ENDPOINTS = {
	activities: {
		groupName: 'Activities',
		groupDescription: 'Gestión de actividades turísticas',
		// Endpoints
		list: {
			path: () => BASE_PATHS.activities,
			method: 'GET',
			description: 'Obtiene listado de actividades con paginación',
			params: ['page', 'limit', 'status']
		},
		detail: {
			path: (slug: string) => `${BASE_PATHS.activities}/${slug}`,
			method: 'GET',
			description: 'Obtiene detalles de una actividad específica',
			params: ['slug']
		},
		create: {
			path: () => BASE_PATHS.activities,
			method: 'POST',
			description: 'Crea una nueva actividad',
			params: ['body']
		},
		update: {
			path: (slug: string) => `${BASE_PATHS.activities}/${slug}`,
			method: 'PUT',
			description: 'Actualiza una actividad completa',
			params: ['slug', 'body']
		},
		patch: {
			path: (slug: string) => `${BASE_PATHS.activities}/${slug}`,
			method: 'PATCH',
			description: 'Actualiza parcialmente una actividad',
			params: ['slug', 'body']
		},
		delete: {
			path: (slug: string) => `${BASE_PATHS.activities}/${slug}`,
			method: 'DELETE',
			description: 'Elimina una actividad',
			params: ['slug']
		},
		statuses: {
			path: () => '/activity-status',
			method: 'GET',
			description: 'Obtiene los estados disponibles para actividades',
			params: []
		}
	},
	attractions: {
		groupName: 'Attractions',
		groupDescription: 'Gestión de atracciones turísticas',
		// Endpoints
		list: {
			path: () => BASE_PATHS.attractions,
			method: 'GET',
			description: 'Obtiene listado de atracciones con paginación',
			params: ['page', 'limit']
		},
		detail: {
			path: (id: string) => `${BASE_PATHS.attractions}/${id}`,
			method: 'GET',
			description: 'Obtiene detalles de una atracción específica',
			params: ['id']
		},
		search: {
			path: () => `${BASE_PATHS.attractions}/search`,
			method: 'GET',
			description: 'Busca atracciones por criterios',
			params: ['q', 'filters']
		},
		delete: {
			path: (slug: string) => `${BASE_PATHS.attractions}/${slug}`,
			method: 'DELETE',
			description: 'Elimina una atracción',
			params: ['slug']
		},
		statuses: {
			path: () => '/attraction-status',
			method: 'GET',
			description: 'Obtiene los estados disponibles para atracciones',
			params: []
		}
	},
	destinations: {
		groupName: 'Destinations',
		groupDescription: 'Gestión de destinos turísticos',
		// Endpoints
		list: {
			path: () => BASE_PATHS.destinations,
			method: 'GET',
			description: 'Obtiene listado de destinos con paginación',
			params: ['page', 'limit']
		},
		detail: {
			path: (id: string) => `${BASE_PATHS.destinations}/${id}`,
			method: 'GET',
			description: 'Obtiene detalles de un destino específico',
			params: ['id']
		},
		search: {
			path: () => `${BASE_PATHS.destinations}/search`,
			method: 'GET',
			description: 'Busca destinos por criterios',
			params: ['q', 'filters']
		},
		delete: {
			path: (slug: string) => `${BASE_PATHS.destinations}/${slug}`,
			method: 'DELETE',
			description: 'Elimina un destino',
			params: ['slug']
		}
	},
	locations: {
		groupName: 'Locations',
		groupDescription: 'Gestión de ubicaciones geográficas',
		// Endpoints
		list: {
			path: () => BASE_PATHS.locations,
			method: 'GET',
			description: 'Obtiene listado de ubicaciones',
			params: ['page', 'limit']
		},
		detail: {
			path: (id: string) => `${BASE_PATHS.locations}/${id}`,
			method: 'GET',
			description: 'Obtiene detalles de una ubicación específica',
			params: ['id']
		},
		search: {
			path: () => `${BASE_PATHS.locations}/search`,
			method: 'GET',
			description: 'Busca ubicaciones por criterios',
			params: ['q', 'filters']
		}
	},
	categories: {
		groupName: 'Categories',
		groupDescription: 'Gestión de categorías',
		// Endpoints
		list: {
			path: () => BASE_PATHS.categories,
			method: 'GET',
			description: 'Obtiene listado de categorías',
			params: []
		},
		detail: {
			path: (id: string) => `${BASE_PATHS.categories}/${id}`,
			method: 'GET',
			description: 'Obtiene detalles de una categoría específica',
			params: ['id']
		}
	},
	tags: {
		groupName: 'Tags',
		groupDescription: 'Gestión de etiquetas',
		// Endpoints
		list: {
			path: () => BASE_PATHS.tags,
			method: 'GET',
			description: 'Obtiene listado de etiquetas',
			params: []
		},
		detail: {
			path: (id: string) => `${BASE_PATHS.tags}/${id}`,
			method: 'GET',
			description: 'Obtiene detalles de una etiqueta específica',
			params: ['id']
		}
	},
	auth: {
		groupName: 'Authentication',
		groupDescription: 'Autenticación y gestión de sesiones',
		// Endpoints
		login: {
			path: () => `${BASE_PATHS.auth}/login`,
			method: 'POST',
			description: 'Inicia sesión de usuario',
			params: ['email', 'password']
		},
		logout: {
			path: () => `${BASE_PATHS.auth}/logout`,
			method: 'POST',
			description: 'Cierra sesión de usuario',
			params: []
		},
		refresh: {
			path: () => `${BASE_PATHS.auth}/refresh`,
			method: 'POST',
			description: 'Refresca el token de autenticación',
			params: ['refreshToken']
		},
		me: {
			path: () => `${BASE_PATHS.auth}/me`,
			method: 'GET',
			description: 'Obtiene información del usuario actual',
			params: []
		}
	}
} as const;

export function buildEndpointUrl(
	path: string,
	params?: Record<string, string | number | boolean | undefined>
): string {
	if (!params) return path;

	const searchParams = new URLSearchParams();
	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined) {
			searchParams.set(key, String(value));
		}
	});

	const query = searchParams.toString();
	return query ? `${path}?${query}` : path;
}
