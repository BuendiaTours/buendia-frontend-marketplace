/**
 * @module _shared/endpoints.config
 * @description Centralised endpoint registry for every API resource.
 * Each entry declares the HTTP method, URL builder, human-readable description,
 * and expected parameters. Consumed primarily by documentation tooling and
 * by direct callers that need a canonical path.
 */

/** Base path segments for each API resource. */
export const BASE_PATHS = {
	activities: '/activities',
	activityKinds: '/activity-kind',
	activityOptions: '/activity-options/by-activity',
	attractions: '/attractions',
	auth: '/auth',
	availabilityOptions: '/availability-options',
	bookingQuestions: '/booking-questions',
	categories: '/categories',
	destinations: '/destinations',
	distributives: '/distributives',
	locations: '/locations',
	newsletter: '/newsletter',
	reviews: '/reviews',
	tags: '/tags'
} as const;

/** Supported HTTP methods. */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** An endpoint whose path requires no dynamic segment. */
type Endpoint = {
	path: () => string;
	method: HttpMethod;
	description: string;
	params?: string[];
};

/** An endpoint whose path requires a single dynamic parameter (e.g. an ID or slug). */
type EndpointWithParam = {
	path: (param: string) => string;
	method: HttpMethod;
	description: string;
	params?: string[];
};

/**
 * Complete registry of all REST API endpoints grouped by resource.
 *
 * Each resource group contains:
 * - `groupName` / `groupDescription` – metadata for documentation.
 * - Named endpoint entries with `path()`, `method`, `description`, and `params`.
 */
export const API_ENDPOINTS = {
	// ──────────────────────────────────────────────
	// Activities
	// ──────────────────────────────────────────────
	activities: {
		groupName: 'Activities',
		groupDescription: 'Gestión de actividades turísticas',
		/** @description Retrieves a paginated list of activities. */
		list: {
			path: () => BASE_PATHS.activities,
			method: 'GET',
			description: 'Obtiene listado de actividades con paginación',
			params: ['skip', 'limit', 'status']
		} satisfies Endpoint,
		/** @description Retrieves a single activity by its ID. */
		detail: {
			path: (id: string) => `${BASE_PATHS.activities}/${id}`,
			method: 'GET',
			description: 'Obtiene detalles de una actividad por ID',
			params: ['id']
		} satisfies EndpointWithParam,
		/** @description Retrieves a single activity by its URL slug. */
		detailBySlug: {
			path: (slug: string) => `${BASE_PATHS.activities}/slug/${slug}`,
			method: 'GET',
			description: 'Obtiene detalles de una actividad por slug',
			params: ['slug']
		} satisfies EndpointWithParam,
		/** @description Creates a new activity resource. */
		create: {
			path: () => BASE_PATHS.activities,
			method: 'POST',
			description: 'Crea una nueva actividad',
			params: ['body']
		} satisfies Endpoint,
		/** @description Fully replaces an activity identified by ID. */
		update: {
			path: (id: string) => `${BASE_PATHS.activities}/${id}`,
			method: 'PUT',
			description: 'Actualiza una actividad por ID',
			params: ['id', 'body']
		} satisfies EndpointWithParam,
		/** @description Fully replaces an activity identified by slug. */
		updateBySlug: {
			path: (slug: string) => `${BASE_PATHS.activities}/slug/${slug}`,
			method: 'PUT',
			description: 'Actualiza una actividad por slug',
			params: ['slug', 'body']
		} satisfies EndpointWithParam,
		/** @description Partially updates an activity identified by ID. */
		patch: {
			path: (id: string) => `${BASE_PATHS.activities}/${id}`,
			method: 'PATCH',
			description: 'Actualiza parcialmente una actividad por ID',
			params: ['id', 'body']
		} satisfies EndpointWithParam,
		/** @description Partially updates an activity identified by slug. */
		patchBySlug: {
			path: (slug: string) => `${BASE_PATHS.activities}/slug/${slug}`,
			method: 'PATCH',
			description: 'Actualiza parcialmente una actividad por slug',
			params: ['slug', 'body']
		} satisfies EndpointWithParam,
		/** @description Deletes an activity identified by ID. */
		delete: {
			path: (id: string) => `${BASE_PATHS.activities}/${id}`,
			method: 'DELETE',
			description: 'Elimina una actividad por ID',
			params: ['id']
		} satisfies EndpointWithParam,
		/** @description Deletes an activity identified by slug. */
		deleteBySlug: {
			path: (slug: string) => `${BASE_PATHS.activities}/slug/${slug}`,
			method: 'DELETE',
			description: 'Elimina una actividad por slug',
			params: ['slug']
		} satisfies EndpointWithParam
	},

	// ──────────────────────────────────────────────
	// Attractions
	// ──────────────────────────────────────────────
	attractions: {
		groupName: 'Attractions',
		groupDescription: 'Gestión de atracciones turísticas',
		/** @description Retrieves a paginated list of attractions. */
		list: {
			path: () => BASE_PATHS.attractions,
			method: 'GET',
			description: 'Obtiene listado de atracciones con paginación',
			params: ['skip', 'limit']
		} satisfies Endpoint,
		/** @description Retrieves a single attraction by its ID. */
		detail: {
			path: (id: string) => `${BASE_PATHS.attractions}/${id}`,
			method: 'GET',
			description: 'Obtiene detalles de una atracción por ID',
			params: ['id']
		} satisfies EndpointWithParam,
		/** @description Retrieves a single attraction by its URL slug. */
		detailBySlug: {
			path: (slug: string) => `${BASE_PATHS.attractions}/slug/${slug}`,
			method: 'GET',
			description: 'Obtiene detalles de una atracción por slug',
			params: ['slug']
		} satisfies EndpointWithParam,
		/** @description Searches attractions by query and filter criteria. */
		search: {
			path: () => `${BASE_PATHS.attractions}/search`,
			method: 'GET',
			description: 'Busca atracciones por criterios',
			params: ['q', 'filters']
		} satisfies Endpoint,
		/** @description Deletes an attraction identified by ID. */
		delete: {
			path: (id: string) => `${BASE_PATHS.attractions}/${id}`,
			method: 'DELETE',
			description: 'Elimina una atracción por ID',
			params: ['id']
		} satisfies EndpointWithParam,
		/** @description Deletes an attraction identified by slug. */
		deleteBySlug: {
			path: (slug: string) => `${BASE_PATHS.attractions}/slug/${slug}`,
			method: 'DELETE',
			description: 'Elimina una atracción por slug',
			params: ['slug']
		} satisfies EndpointWithParam,
		/** @description Fully replaces an attraction identified by slug. */
		updateBySlug: {
			path: (slug: string) => `${BASE_PATHS.attractions}/slug/${slug}`,
			method: 'PUT',
			description: 'Actualiza una atracción por slug',
			params: ['slug', 'body']
		} satisfies EndpointWithParam
	},

	// ──────────────────────────────────────────────
	// Destinations
	// ──────────────────────────────────────────────
	destinations: {
		groupName: 'Destinations',
		groupDescription: 'Gestión de destinos turísticos',
		/** @description Retrieves a paginated list of destinations. */
		list: {
			path: () => BASE_PATHS.destinations,
			method: 'GET',
			description: 'Obtiene listado de destinos con paginación',
			params: ['skip', 'limit']
		} satisfies Endpoint,
		/** @description Retrieves a single destination by its ID. */
		detail: {
			path: (id: string) => `${BASE_PATHS.destinations}/${id}`,
			method: 'GET',
			description: 'Obtiene detalles de un destino por ID',
			params: ['id']
		} satisfies EndpointWithParam,
		/** @description Retrieves a single destination by its URL slug. */
		detailBySlug: {
			path: (slug: string) => `${BASE_PATHS.destinations}/slug/${slug}`,
			method: 'GET',
			description: 'Obtiene detalles de un destino por slug',
			params: ['slug']
		} satisfies EndpointWithParam,
		/** @description Searches destinations by query and filter criteria. */
		search: {
			path: () => `${BASE_PATHS.destinations}/search`,
			method: 'GET',
			description: 'Busca destinos por criterios',
			params: ['q', 'filters']
		} satisfies Endpoint,
		/** @description Deletes a destination identified by ID. */
		delete: {
			path: (id: string) => `${BASE_PATHS.destinations}/${id}`,
			method: 'DELETE',
			description: 'Elimina un destino por ID',
			params: ['id']
		} satisfies EndpointWithParam,
		/** @description Deletes a destination identified by slug. */
		deleteBySlug: {
			path: (slug: string) => `${BASE_PATHS.destinations}/slug/${slug}`,
			method: 'DELETE',
			description: 'Elimina un destino por slug',
			params: ['slug']
		} satisfies EndpointWithParam,
		/** @description Fully replaces a destination identified by slug. */
		updateBySlug: {
			path: (slug: string) => `${BASE_PATHS.destinations}/slug/${slug}`,
			method: 'PUT',
			description: 'Actualiza un destino por slug',
			params: ['slug', 'body']
		} satisfies EndpointWithParam,
		/** @description Retrieves paginated activities for a destination by its ID. */
		activitiesByDestination: {
			path: (id: string) => `/destination/${id}/activities`,
			method: 'GET',
			description: 'Obtiene actividades paginadas de un destino por ID',
			params: ['id', 'page', 'pageSize', 'kind']
		} satisfies EndpointWithParam
	},

	// ──────────────────────────────────────────────
	// Locations
	// ──────────────────────────────────────────────
	locations: {
		groupName: 'Locations',
		groupDescription: 'Gestión de ubicaciones geográficas',
		/** @description Retrieves a paginated list of geographic locations. */
		list: {
			path: () => BASE_PATHS.locations,
			method: 'GET',
			description: 'Obtiene listado de ubicaciones',
			params: ['skip', 'limit']
		} satisfies Endpoint,
		/** @description Retrieves a single location by its ID. */
		detail: {
			path: (id: string) => `${BASE_PATHS.locations}/${id}`,
			method: 'GET',
			description: 'Obtiene detalles de una ubicación específica',
			params: ['id']
		} satisfies EndpointWithParam,
		/** @description Searches locations by query and filter criteria. */
		search: {
			path: () => `${BASE_PATHS.locations}/search`,
			method: 'GET',
			description: 'Busca ubicaciones por criterios',
			params: ['q', 'filters']
		} satisfies Endpoint
	},

	// ──────────────────────────────────────────────
	// Categories
	// ──────────────────────────────────────────────
	categories: {
		groupName: 'Categories',
		groupDescription: 'Gestión de categorías',
		/** @description Retrieves all categories. */
		list: {
			path: () => BASE_PATHS.categories,
			method: 'GET',
			description: 'Obtiene listado de categorías',
			params: []
		} satisfies Endpoint,
		/** @description Retrieves a single category by its ID. */
		detail: {
			path: (id: string) => `${BASE_PATHS.categories}/${id}`,
			method: 'GET',
			description: 'Obtiene detalles de una categoría específica',
			params: ['id']
		} satisfies EndpointWithParam
	},

	// ──────────────────────────────────────────────
	// Tags
	// ──────────────────────────────────────────────
	tags: {
		groupName: 'Tags',
		groupDescription: 'Gestión de etiquetas',
		/** @description Retrieves all tags. */
		list: {
			path: () => BASE_PATHS.tags,
			method: 'GET',
			description: 'Obtiene listado de etiquetas',
			params: []
		} satisfies Endpoint,
		/** @description Retrieves a single tag by its ID. */
		detail: {
			path: (id: string) => `${BASE_PATHS.tags}/${id}`,
			method: 'GET',
			description: 'Obtiene detalles de una etiqueta específica',
			params: ['id']
		} satisfies EndpointWithParam
	},

	// ──────────────────────────────────────────────
	// Distributives
	// ──────────────────────────────────────────────
	distributives: {
		groupName: 'Distributives',
		groupDescription: 'Gestión de distributivos',
		/** @description Retrieves all distributives. */
		list: {
			path: () => BASE_PATHS.distributives,
			method: 'GET',
			description: 'Obtiene listado de distributivos',
			params: []
		} satisfies Endpoint,
		/** @description Retrieves a single distributive by its ID. */
		detail: {
			path: (id: string) => `${BASE_PATHS.distributives}/${id}`,
			method: 'GET',
			description: 'Obtiene detalles de un distributivo específico',
			params: ['id']
		} satisfies EndpointWithParam
	},

	// ──────────────────────────────────────────────
	// Activity Kinds
	// ──────────────────────────────────────────────
	activityKinds: {
		groupName: 'Activity Kinds',
		groupDescription: 'Tipos de actividad',
		list: {
			path: () => BASE_PATHS.activityKinds,
			method: 'GET',
			description: 'Obtiene listado de tipos de actividad'
		} satisfies Endpoint
	},

	// ──────────────────────────────────────────────
	// Activity Options
	// ──────────────────────────────────────────────
	activityOptions: {
		groupName: 'Activity Options',
		groupDescription: 'Opciones adicionales de actividades',
		/** @description Retrieves all options for a given activity ID. */
		byActivity: {
			path: (activityId: string) => `${BASE_PATHS.activityOptions}/${activityId}`,
			method: 'GET',
			description: 'Obtiene las opciones adicionales de una actividad por ID',
			params: ['activityId']
		} satisfies EndpointWithParam
	},

	// ──────────────────────────────────────────────
	// Availability Options
	// ──────────────────────────────────────────────
	availabilityOptions: {
		groupName: 'Availability Options',
		groupDescription: 'Disponibilidad en tiempo real de actividades',
		/** @description Retrieves real-time availability for a given activity ID. */
		byActivity: {
			path: (activityId: string, fromDate?: string) =>
				fromDate
					? `/availability-options?activityId=${activityId}&fromDate=${fromDate}`
					: `/availability-options?activityId=${activityId}`,
			method: 'GET',
			description:
				'Obtiene disponibilidad en tiempo real de una actividad por ID. Acepta fecha de inicio opcional (YYYY-MM-DD); devuelve 2 meses desde esa fecha.',
			params: ['activityId', 'fromDate?']
		}
	},

	// ──────────────────────────────────────────────
	// Reviews
	// ──────────────────────────────────────────────
	reviews: {
		groupName: 'Reviews',
		groupDescription: 'Reseñas de actividades',
		/** @description Retrieves all reviews for a given activity ID. */
		byActivity: {
			path: () => BASE_PATHS.reviews,
			method: 'GET',
			description: 'Obtiene reviews de una actividad por ID'
		} satisfies Endpoint,
		byActivityStats: {
			path: (activityId: string) => `${BASE_PATHS.reviews}/${activityId}/stats`,
			method: 'GET',
			description: 'Obtiene estadísticas de reviews de una actividad',
			params: ['activityId']
		} satisfies EndpointWithParam,
		byActivityAttachments: {
			path: (activityId: string) => `${BASE_PATHS.reviews}/${activityId}/attachments`,
			method: 'GET',
			description: 'Obtiene adjuntos de reviews de una actividad',
			params: ['activityId']
		} satisfies EndpointWithParam,
		byId: {
			path: (reviewId: string) => `${BASE_PATHS.reviews}/${reviewId}`,
			method: 'GET',
			description: 'Obtiene una review por su ID',
			params: ['reviewId']
		} satisfies EndpointWithParam,
		byDestinationSlug: {
			path: (slug: string, page: number) => `/destination/${slug}/reviews/${page}`,
			method: 'GET',
			description: 'Obtiene reviews de un destino por slug y página',
			params: ['slug', 'page']
		}
	},

	// ──────────────────────────────────────────────
	// Authentication
	// ──────────────────────────────────────────────
	auth: {
		groupName: 'Authentication',
		groupDescription: 'Autenticación y gestión de sesiones',
		/** @description Authenticates a user with email and password credentials. */
		login: {
			path: () => `${BASE_PATHS.auth}/login`,
			method: 'POST',
			description: 'Inicia sesión de usuario',
			params: ['email', 'password']
		} satisfies Endpoint,
		/** @description Ends the current user session. */
		logout: {
			path: () => `${BASE_PATHS.auth}/logout`,
			method: 'POST',
			description: 'Cierra sesión de usuario',
			params: []
		} satisfies Endpoint,
		/** @description Refreshes the authentication token. */
		refresh: {
			path: () => `${BASE_PATHS.auth}/refresh`,
			method: 'POST',
			description: 'Refresca el token de autenticación',
			params: ['refreshToken']
		} satisfies Endpoint,
		/** @description Retrieves information about the currently authenticated user. */
		me: {
			path: () => `${BASE_PATHS.auth}/me`,
			method: 'GET',
			description: 'Obtiene información del usuario actual',
			params: []
		} satisfies Endpoint
	},

	// ──────────────────────────────────────────────
	// Orders
	// ──────────────────────────────────────────────
	orders: {
		groupName: 'Orders',
		groupDescription: 'Gestión de pedidos del carrito',
		create: {
			path: () => '/orders',
			method: 'POST',
			description: 'Crea un nuevo pedido con el primer booking'
		} satisfies Endpoint,
		getById: {
			path: (id: string) => `/orders/${id}`,
			method: 'GET',
			description: 'Obtiene un pedido por ID',
			params: ['id']
		} satisfies EndpointWithParam,
		update: {
			path: (id: string) => `/orders/${id}`,
			method: 'PATCH',
			description: 'Actualiza datos de contacto del pedido',
			params: ['id']
		} satisfies EndpointWithParam,
		addBooking: {
			path: (id: string) => `/orders/${id}/bookings`,
			method: 'POST',
			description: 'Añade un booking a un pedido existente',
			params: ['id']
		} satisfies EndpointWithParam
	},

	// ──────────────────────────────────────────────
	// Bookings
	// ──────────────────────────────────────────────
	bookings: {
		groupName: 'Bookings',
		groupDescription: 'Gestión de reservas individuales',
		search: {
			path: () => '/bookings',
			method: 'GET',
			description: 'Busca bookings por filtros (orderId, status, etc.)'
		} satisfies Endpoint,
		delete: {
			path: (id: string) => `/bookings/${id}`,
			method: 'DELETE',
			description: 'Elimina un booking',
			params: ['id']
		} satisfies EndpointWithParam
	},

	// ──────────────────────────────────────────────
	// Booking Questions
	// ──────────────────────────────────────────────
	bookingQuestions: {
		groupName: 'Booking Questions',
		groupDescription: 'Preguntas obligatorias por opción de actividad',
		byActivityOption: {
			path: (optionId: string) => `${BASE_PATHS.bookingQuestions}/by-activity-option/${optionId}`,
			method: 'GET',
			description: 'Obtiene preguntas de una opción de actividad'
		} satisfies EndpointWithParam
	},

	// Newsletter
	// ──────────────────────────────────────────────
	newsletter: {
		groupName: 'Newsletter',
		groupDescription: 'Suscripción a la newsletter',
		/** @description Subscribes an email address to the newsletter. */
		subscribe: {
			path: () => `${BASE_PATHS.newsletter}/subscribe`,
			method: 'POST',
			description: 'Suscribe un email a la newsletter',
			params: ['email']
		} satisfies Endpoint
	}
} as const;
