/**
 * @module routes/backoffice/locations
 * @description Backoffice route definitions for the Locations resource.
 */

import { backoffice } from '../core';

/** Backoffice URL helpers for location pages. */
export const LOCATION_ROUTES = {
	list: backoffice('locations'),
	create: backoffice('locations/create'),
	detail: (id: string) => backoffice('locations', id),
	edit: (id: string) => backoffice('locations', id, 'edit')
} as const;
