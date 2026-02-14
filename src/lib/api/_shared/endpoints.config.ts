export const BASE_PATHS = {
	activities: '/activities',
	locations: '/locations',
	categories: '/categories',
	tags: '/tags',
	attractions: '/attractions',
	destinations: '/destinations',
	distributives: '/distributives',
	auth: '/auth'
} as const;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type Endpoint = {
	path: () => string;
	method: HttpMethod;
	description: string;
	params?: string[];
};

type EndpointWithParam = {
	path: (param: string) => string;
	method: HttpMethod;
	description: string;
	params?: string[];
};

export const API_ENDPOINTS = {
	activities: {
		groupName: 'Activities',
		groupDescription: 'Gestión de actividades turísticas',
		list: {
			path: () => BASE_PATHS.activities,
			method: 'GET',
			description: 'Obtiene listado de actividades con paginación',
			params: ['skip', 'limit', 'status']
		} satisfies Endpoint,
		detail: {
			path: (id: string) => `${BASE_PATHS.activities}/${id}`,
			method: 'GET',
			description: 'Obtiene detalles de una actividad por ID',
			params: ['id']
		} satisfies EndpointWithParam,
		detailBySlug: {
			path: (slug: string) => `${BASE_PATHS.activities}/slug/${slug}`,
			method: 'GET',
			description: 'Obtiene detalles de una actividad por slug',
			params: ['slug']
		} satisfies EndpointWithParam,
		create: {
			path: () => BASE_PATHS.activities,
			method: 'POST',
			description: 'Crea una nueva actividad',
			params: ['body']
		} satisfies Endpoint,
		update: {
			path: (id: string) => `${BASE_PATHS.activities}/${id}`,
			method: 'PUT',
			description: 'Actualiza una actividad por ID',
			params: ['id', 'body']
		} satisfies EndpointWithParam,
		updateBySlug: {
			path: (slug: string) => `${BASE_PATHS.activities}/slug/${slug}`,
			method: 'PUT',
			description: 'Actualiza una actividad por slug',
			params: ['slug', 'body']
		} satisfies EndpointWithParam,
		patch: {
			path: (id: string) => `${BASE_PATHS.activities}/${id}`,
			method: 'PATCH',
			description: 'Actualiza parcialmente una actividad por ID',
			params: ['id', 'body']
		} satisfies EndpointWithParam,
		patchBySlug: {
			path: (slug: string) => `${BASE_PATHS.activities}/slug/${slug}`,
			method: 'PATCH',
			description: 'Actualiza parcialmente una actividad por slug',
			params: ['slug', 'body']
		} satisfies EndpointWithParam,
		delete: {
			path: (id: string) => `${BASE_PATHS.activities}/${id}`,
			method: 'DELETE',
			description: 'Elimina una actividad por ID',
			params: ['id']
		} satisfies EndpointWithParam,
		deleteBySlug: {
			path: (slug: string) => `${BASE_PATHS.activities}/slug/${slug}`,
			method: 'DELETE',
			description: 'Elimina una actividad por slug',
			params: ['slug']
		} satisfies EndpointWithParam,
		statuses: {
			path: () => '/activity-status',
			method: 'GET',
			description: 'Obtiene los estados disponibles para actividades',
			params: []
		} satisfies Endpoint,
		kinds: {
			path: () => '/activity-kind',
			method: 'GET',
			description: 'Obtiene los tipos para actividades (FREE_TOUR, PAID_TOUR...)',
			params: []
		} satisfies Endpoint,
		guideKinds: {
			path: () => '/activity-guide-kind',
			method: 'GET',
			description: 'Obtiene los tipos de guía para actividades',
			params: []
		} satisfies Endpoint
	},
	attractions: {
		groupName: 'Attractions',
		groupDescription: 'Gestión de atracciones turísticas',
		list: {
			path: () => BASE_PATHS.attractions,
			method: 'GET',
			description: 'Obtiene listado de atracciones con paginación',
			params: ['skip', 'limit']
		} satisfies Endpoint,
		detail: {
			path: (id: string) => `${BASE_PATHS.attractions}/${id}`,
			method: 'GET',
			description: 'Obtiene detalles de una atracción por ID',
			params: ['id']
		} satisfies EndpointWithParam,
		detailBySlug: {
			path: (slug: string) => `${BASE_PATHS.attractions}/slug/${slug}`,
			method: 'GET',
			description: 'Obtiene detalles de una atracción por slug',
			params: ['slug']
		} satisfies EndpointWithParam,
		search: {
			path: () => `${BASE_PATHS.attractions}/search`,
			method: 'GET',
			description: 'Busca atracciones por criterios',
			params: ['q', 'filters']
		} satisfies Endpoint,
		delete: {
			path: (id: string) => `${BASE_PATHS.attractions}/${id}`,
			method: 'DELETE',
			description: 'Elimina una atracción por ID',
			params: ['id']
		} satisfies EndpointWithParam,
		deleteBySlug: {
			path: (slug: string) => `${BASE_PATHS.attractions}/slug/${slug}`,
			method: 'DELETE',
			description: 'Elimina una atracción por slug',
			params: ['slug']
		} satisfies EndpointWithParam,
		updateBySlug: {
			path: (slug: string) => `${BASE_PATHS.attractions}/slug/${slug}`,
			method: 'PUT',
			description: 'Actualiza una atracción por slug',
			params: ['slug', 'body']
		} satisfies EndpointWithParam,
		statuses: {
			path: () => '/attraction-status',
			method: 'GET',
			description: 'Obtiene los estados disponibles para atracciones',
			params: []
		} satisfies Endpoint
	},
	destinations: {
		groupName: 'Destinations',
		groupDescription: 'Gestión de destinos turísticos',
		list: {
			path: () => BASE_PATHS.destinations,
			method: 'GET',
			description: 'Obtiene listado de destinos con paginación',
			params: ['skip', 'limit']
		} satisfies Endpoint,
		detail: {
			path: (id: string) => `${BASE_PATHS.destinations}/${id}`,
			method: 'GET',
			description: 'Obtiene detalles de un destino por ID',
			params: ['id']
		} satisfies EndpointWithParam,
		detailBySlug: {
			path: (slug: string) => `${BASE_PATHS.destinations}/slug/${slug}`,
			method: 'GET',
			description: 'Obtiene detalles de un destino por slug',
			params: ['slug']
		} satisfies EndpointWithParam,
		search: {
			path: () => `${BASE_PATHS.destinations}/search`,
			method: 'GET',
			description: 'Busca destinos por criterios',
			params: ['q', 'filters']
		} satisfies Endpoint,
		delete: {
			path: (id: string) => `${BASE_PATHS.destinations}/${id}`,
			method: 'DELETE',
			description: 'Elimina un destino por ID',
			params: ['id']
		} satisfies EndpointWithParam,
		deleteBySlug: {
			path: (slug: string) => `${BASE_PATHS.destinations}/slug/${slug}`,
			method: 'DELETE',
			description: 'Elimina un destino por slug',
			params: ['slug']
		} satisfies EndpointWithParam,
		updateBySlug: {
			path: (slug: string) => `${BASE_PATHS.destinations}/slug/${slug}`,
			method: 'PUT',
			description: 'Actualiza un destino por slug',
			params: ['slug', 'body']
		} satisfies EndpointWithParam
	},
	locations: {
		groupName: 'Locations',
		groupDescription: 'Gestión de ubicaciones geográficas',
		list: {
			path: () => BASE_PATHS.locations,
			method: 'GET',
			description: 'Obtiene listado de ubicaciones',
			params: ['skip', 'limit']
		} satisfies Endpoint,
		detail: {
			path: (id: string) => `${BASE_PATHS.locations}/${id}`,
			method: 'GET',
			description: 'Obtiene detalles de una ubicación específica',
			params: ['id']
		} satisfies EndpointWithParam,
		search: {
			path: () => `${BASE_PATHS.locations}/search`,
			method: 'GET',
			description: 'Busca ubicaciones por criterios',
			params: ['q', 'filters']
		} satisfies Endpoint
	},
	categories: {
		groupName: 'Categories',
		groupDescription: 'Gestión de categorías',
		list: {
			path: () => BASE_PATHS.categories,
			method: 'GET',
			description: 'Obtiene listado de categorías',
			params: []
		} satisfies Endpoint,
		detail: {
			path: (id: string) => `${BASE_PATHS.categories}/${id}`,
			method: 'GET',
			description: 'Obtiene detalles de una categoría específica',
			params: ['id']
		} satisfies EndpointWithParam
	},
	tags: {
		groupName: 'Tags',
		groupDescription: 'Gestión de etiquetas',
		list: {
			path: () => BASE_PATHS.tags,
			method: 'GET',
			description: 'Obtiene listado de etiquetas',
			params: []
		} satisfies Endpoint,
		detail: {
			path: (id: string) => `${BASE_PATHS.tags}/${id}`,
			method: 'GET',
			description: 'Obtiene detalles de una etiqueta específica',
			params: ['id']
		} satisfies EndpointWithParam
	},
	distributives: {
		groupName: 'Distributives',
		groupDescription: 'Gestión de distributivos',
		list: {
			path: () => BASE_PATHS.distributives,
			method: 'GET',
			description: 'Obtiene listado de distributivos',
			params: []
		} satisfies Endpoint,
		detail: {
			path: (id: string) => `${BASE_PATHS.distributives}/${id}`,
			method: 'GET',
			description: 'Obtiene detalles de un distributivo específico',
			params: ['id']
		} satisfies EndpointWithParam
	},
	auth: {
		groupName: 'Authentication',
		groupDescription: 'Autenticación y gestión de sesiones',
		login: {
			path: () => `${BASE_PATHS.auth}/login`,
			method: 'POST',
			description: 'Inicia sesión de usuario',
			params: ['email', 'password']
		} satisfies Endpoint,
		logout: {
			path: () => `${BASE_PATHS.auth}/logout`,
			method: 'POST',
			description: 'Cierra sesión de usuario',
			params: []
		} satisfies Endpoint,
		refresh: {
			path: () => `${BASE_PATHS.auth}/refresh`,
			method: 'POST',
			description: 'Refresca el token de autenticación',
			params: ['refreshToken']
		} satisfies Endpoint,
		me: {
			path: () => `${BASE_PATHS.auth}/me`,
			method: 'GET',
			description: 'Obtiene información del usuario actual',
			params: []
		} satisfies Endpoint
	}
} as const;
