/**
 * @module routes/backoffice/activities
 * @description Backoffice route definitions for the Activities resource.
 */

import { backoffice } from '../core';

export const ACTIVITY_ROUTES = {
	list: backoffice('activities'),
	create: backoffice('activities/create'),
	edit: (id: string) => backoffice('activities', id, 'edit'),
	locations: (id: string) => backoffice('activities', id, 'locations'),
	meals: (id: string) => backoffice('activities', id, 'meals'),
	addons: (id: string) => backoffice('activities', id, 'addons')
} as const;
