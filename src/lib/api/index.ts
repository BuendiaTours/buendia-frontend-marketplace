export { apiClient } from './client';
export { apiConfig } from './config';
export * from './types';
export * from './errors';
export * from './endpoints.config';

import { activitiesEndpoints } from './endpoints/activities';
import { destinationsEndpoints } from './endpoints/destinations';
import { categoriesEndpoints } from './endpoints/categories';
import { tagsEndpoints } from './endpoints/tags';
import { attractionsEndpoints } from './endpoints/attractions';

export const api = {
	activities: activitiesEndpoints,
	destinations: destinationsEndpoints,
	categories: categoriesEndpoints,
	tags: tagsEndpoints,
	attractions: attractionsEndpoints
};

export type { ActivitiesGetAllParams } from './endpoints/activities';
export type { DestinationsSearchParams } from './endpoints/destinations';
export type { Category } from './endpoints/categories';
export type { Tag } from './endpoints/tags';
export type { Attraction } from '$lib/types';
