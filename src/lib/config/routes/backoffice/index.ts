/**
 * @module routes/backoffice
 * @description Aggregated backoffice route definitions.
 * Each resource defines its own route file in this directory.
 */

import { backoffice } from '../core';
import { USER_ROUTES } from './users';
import { ACTIVITY_ROUTES } from './activities';
import { ATTRACTION_ROUTES } from './attractions';
import { CATEGORY_ROUTES } from './categories';
import { LOCATION_ROUTES } from './locations';
import { PICKUP_POINT_ROUTES } from './pickupPoints';
import { SUPPLIER_ROUTES } from './suppliers';
import { TAG_ROUTES } from './tags';
import { toolsRoutes } from './tools';

export const backofficeRoutes = {
	home: backoffice(''),
	login: backoffice('login'),

	users: USER_ROUTES,
	activities: ACTIVITY_ROUTES,
	attractions: ATTRACTION_ROUTES,
	categories: CATEGORY_ROUTES,
	locations: LOCATION_ROUTES,
	pickupPoints: PICKUP_POINT_ROUTES,
	suppliers: SUPPLIER_ROUTES,
	tags: TAG_ROUTES,
	...toolsRoutes
} as const;
