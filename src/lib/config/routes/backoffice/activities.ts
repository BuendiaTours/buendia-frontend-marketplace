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
	addons: (id: string) => backoffice('activities', id, 'addons'),
	contentBlocks: (id: string) => backoffice('activities', id, 'content-blocks'),
	stages: (id: string) => backoffice('activities', id, 'stages'),
	indexation: (id: string) => backoffice('activities', id, 'indexation'),
	options: (id: string) => backoffice('activities', id, 'options'),
	optionCreate: (id: string) => backoffice('activities', id, 'options', 'create'),
	optionEdit: (activityId: string, optionId: string) =>
		backoffice('activities', activityId, 'options', optionId, 'edit'),
	optionTickets: (activityId: string, optionId: string) =>
		backoffice('activities', activityId, 'options', optionId, 'tickets'),
	optionPickup: (activityId: string, optionId: string) =>
		backoffice('activities', activityId, 'options', optionId, 'pickup'),
	optionBookingSystem: (activityId: string, optionId: string) =>
		backoffice('activities', activityId, 'options', optionId, 'booking-system')
} as const;
