export const BASE_PATHS = {
	activities: '/activities',
	locations: '/locations',
	categories: '/categories',
	tags: '/tags',
	attractions: '/attractions',
	users: '/users',
	auth: '/auth'
} as const;

export const ACTIVITIES_ENDPOINTS = {
	list: () => BASE_PATHS.activities,
	detail: (slug: string) => `${BASE_PATHS.activities}/${slug}`,
	create: () => BASE_PATHS.activities,
	update: (slug: string) => `${BASE_PATHS.activities}/${slug}`,
	delete: (slug: string) => `${BASE_PATHS.activities}/${slug}`,
	patch: (slug: string) => `${BASE_PATHS.activities}/${slug}`
} as const;

export const LOCATIONS_ENDPOINTS = {
	list: () => BASE_PATHS.locations,
	detail: (id: string) => `${BASE_PATHS.locations}/${id}`,
	search: () => `${BASE_PATHS.locations}/search`
} as const;

export const CATEGORIES_ENDPOINTS = {
	list: () => BASE_PATHS.categories,
	detail: (id: string) => `${BASE_PATHS.categories}/${id}`
} as const;

export const TAGS_ENDPOINTS = {
	list: () => BASE_PATHS.tags,
	detail: (id: string) => `${BASE_PATHS.tags}/${id}`
} as const;

export const ATTRACTIONS_ENDPOINTS = {
	list: () => BASE_PATHS.attractions,
	detail: (id: string) => `${BASE_PATHS.attractions}/${id}`
} as const;

export const AUTH_ENDPOINTS = {
	login: () => `${BASE_PATHS.auth}/login`,
	logout: () => `${BASE_PATHS.auth}/logout`,
	refresh: () => `${BASE_PATHS.auth}/refresh`,
	me: () => `${BASE_PATHS.auth}/me`
} as const;

export const API_ENDPOINTS = {
	activities: ACTIVITIES_ENDPOINTS,
	locations: LOCATIONS_ENDPOINTS,
	categories: CATEGORIES_ENDPOINTS,
	tags: TAGS_ENDPOINTS,
	attractions: ATTRACTIONS_ENDPOINTS,
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
