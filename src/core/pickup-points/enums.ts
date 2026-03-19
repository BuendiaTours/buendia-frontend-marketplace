/**
 * @module pickup-points/enums
 * @description Domain enums for the Pickup Points resource.
 * These mirror the backend contract exactly and carry no UI or i18n dependencies.
 */

/** Kind of usage of a pickup point when linked to an activity option. */
export enum PickupPointKind {
	PICKUP = 'PICKUP',
	DROPOFF = 'DROPOFF'
}

/** Sort options for pickup point queries. */
export enum PickupPointSort {
	NAME = 'NAME',
	CREATED_AT = 'CREATED_AT'
}
