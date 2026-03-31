/**
 * @module booking-systems/registry
 * @description Central registry that maps each BookingSystem enum value to its adapter.
 * To add a new booking system, import its adapter and add an entry to the map.
 */

import type { BookingSystem } from '$core/bookings/enums';
import type { BookingSystemAdapter } from './types';
import { bokunAdapter } from './adapters/bokun/bokun.adapter';
import { turitopAdapter } from './adapters/turitop/turitop.adapter';

const adapters: Map<BookingSystem, BookingSystemAdapter> = new Map([
	[bokunAdapter.key, bokunAdapter],
	[turitopAdapter.key, turitopAdapter]
]);

export function getAdapter(system: BookingSystem): BookingSystemAdapter | undefined {
	return adapters.get(system);
}

export function getAllAdapters(): BookingSystemAdapter[] {
	return [...adapters.values()];
}
