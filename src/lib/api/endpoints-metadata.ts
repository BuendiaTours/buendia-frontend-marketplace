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
export const ENDPOINTS_METADATA = {
	activities: {
		groupName: 'Activities',
		groupDescription: 'Gestión de actividades turísticas',
		endpoints: {
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
		}
	},
	attractions: {
		groupName: 'Attractions',
		groupDescription: 'Gestión de atracciones turísticas',
		endpoints: {
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
		}
	},
	destinations: {
		groupName: 'Destinations',
		groupDescription: 'Gestión de destinos turísticos',
		endpoints: {
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
		}
	},
	locations: {
		groupName: 'Locations',
		groupDescription: 'Gestión de ubicaciones geográficas',
		endpoints: {
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
		}
	},
	categories: {
		groupName: 'Categories',
		groupDescription: 'Gestión de categorías',
		endpoints: {
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
		}
	},
	tags: {
		groupName: 'Tags',
		groupDescription: 'Gestión de etiquetas',
		endpoints: {
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
		}
	},
	auth: {
		groupName: 'Authentication',
		groupDescription: 'Autenticación y gestión de sesiones',
		endpoints: {
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
	}
} as const;

// Extract path functions for backward compatibility
export const ACTIVITIES_ENDPOINTS = {
	list: ENDPOINTS_METADATA.activities.endpoints.list.path,
	detail: ENDPOINTS_METADATA.activities.endpoints.detail.path,
	create: ENDPOINTS_METADATA.activities.endpoints.create.path,
	update: ENDPOINTS_METADATA.activities.endpoints.update.path,
	delete: ENDPOINTS_METADATA.activities.endpoints.delete.path,
	patch: ENDPOINTS_METADATA.activities.endpoints.patch.path,
	statuses: ENDPOINTS_METADATA.activities.endpoints.statuses.path
} as const;

export const LOCATIONS_ENDPOINTS = {
	list: ENDPOINTS_METADATA.locations.endpoints.list.path,
	detail: ENDPOINTS_METADATA.locations.endpoints.detail.path,
	search: ENDPOINTS_METADATA.locations.endpoints.search.path
} as const;

export const CATEGORIES_ENDPOINTS = {
	list: ENDPOINTS_METADATA.categories.endpoints.list.path,
	detail: ENDPOINTS_METADATA.categories.endpoints.detail.path
} as const;

export const TAGS_ENDPOINTS = {
	list: ENDPOINTS_METADATA.tags.endpoints.list.path,
	detail: ENDPOINTS_METADATA.tags.endpoints.detail.path
} as const;

export const ATTRACTIONS_ENDPOINTS = {
	list: ENDPOINTS_METADATA.attractions.endpoints.list.path,
	detail: ENDPOINTS_METADATA.attractions.endpoints.detail.path,
	search: ENDPOINTS_METADATA.attractions.endpoints.search.path,
	delete: ENDPOINTS_METADATA.attractions.endpoints.delete.path,
	statuses: ENDPOINTS_METADATA.attractions.endpoints.statuses.path
} as const;

export const DESTINATIONS_ENDPOINTS = {
	list: ENDPOINTS_METADATA.destinations.endpoints.list.path,
	detail: ENDPOINTS_METADATA.destinations.endpoints.detail.path,
	search: ENDPOINTS_METADATA.destinations.endpoints.search.path,
	delete: ENDPOINTS_METADATA.destinations.endpoints.delete.path
} as const;

export const AUTH_ENDPOINTS = {
	login: ENDPOINTS_METADATA.auth.endpoints.login.path,
	logout: ENDPOINTS_METADATA.auth.endpoints.logout.path,
	refresh: ENDPOINTS_METADATA.auth.endpoints.refresh.path,
	me: ENDPOINTS_METADATA.auth.endpoints.me.path
} as const;

export const API_ENDPOINTS = {
	activities: ACTIVITIES_ENDPOINTS,
	locations: LOCATIONS_ENDPOINTS,
	categories: CATEGORIES_ENDPOINTS,
	tags: TAGS_ENDPOINTS,
	attractions: ATTRACTIONS_ENDPOINTS,
	destinations: DESTINATIONS_ENDPOINTS,
	auth: AUTH_ENDPOINTS
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
