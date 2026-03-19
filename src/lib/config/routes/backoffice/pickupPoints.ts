/**
 * @module routes/backoffice/pickupPoints
 * @description Backoffice route definitions for the Pickup Points resource.
 */

import { backoffice } from '../core';

export const PICKUP_POINT_ROUTES = {
	list: backoffice('pickup-points'),
	create: backoffice('pickup-points/create'),
	edit: (id: string) => backoffice('pickup-points', id, 'edit')
} as const;
