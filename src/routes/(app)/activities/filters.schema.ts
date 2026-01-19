// src/routes/(app)/activities/filters.schema.ts

import type { FiltersSchema } from '$lib/utils/filters';

export type ActivitiesFilters = {
	audioGuideAvailable?: boolean;
	breakfastIncluded?: boolean;
	from?: string;
	isFreeTour?: boolean;
	kidsFreeTour?: boolean;
	location?: string;
	page: number;
	pageSize: number;
	photographyAllowed?: boolean;
	smallGroup?: boolean;
	to?: string;
	wheelchairAccessible?: boolean;
};

export const activitiesFiltersSchema: FiltersSchema<ActivitiesFilters> = {
	fields: {
		page: {
			parse: (raw) => {
				const num = parseInt(raw || '1', 10);
				return num > 0 ? num : 1;
			},
			serialize: (value, out) => {
				out.set('page', String(value ?? 1));
			},
			resetPageOnChange: false
		},
		pageSize: {
			parse: (raw) => {
				const num = parseInt(raw || '10', 10);
				return num > 0 ? num : 10;
			},
			serialize: (value, out) => {
				out.set('pageSize', String(value ?? 10));
			},
			resetPageOnChange: false
		},
		from: {
			parse: (raw) => {
				if (!raw) return undefined;
				// Validar formato YYYY-MM-DD
				if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return undefined;
				return raw;
			},
			serialize: (value, out) => {
				if (value) {
					out.set('from', value);
				} else {
					out.delete('from');
				}
			},
			resetPageOnChange: true
		},
		to: {
			parse: (raw) => {
				if (!raw) return undefined;
				// Validar formato YYYY-MM-DD
				if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return undefined;
				return raw;
			},
			serialize: (value, out) => {
				if (value) {
					out.set('to', value);
				} else {
					out.delete('to');
				}
			},
			resetPageOnChange: true
		},
		isFreeTour: {
			parse: (raw) => {
				// Presence-based: si existe el param (con cualquier valor), es true
				return raw !== null ? true : undefined;
			},
			serialize: (value, out) => {
				if (value === true) {
					out.set('isFreeTour', '1');
				} else {
					out.delete('isFreeTour');
				}
			},
			resetPageOnChange: true
		},
		location: {
			parse: (raw) => {
				return raw || undefined;
			},
			serialize: (value, out) => {
				if (value) {
					out.set('location', value);
				} else {
					out.delete('location');
				}
			},
			resetPageOnChange: true
		},
		kidsFreeTour: {
			parse: (raw) => {
				return raw !== null ? true : undefined;
			},
			serialize: (value, out) => {
				if (value === true) {
					out.set('kidsFreeTour', '1');
				} else {
					out.delete('kidsFreeTour');
				}
			},
			resetPageOnChange: true
		},
		breakfastIncluded: {
			parse: (raw) => {
				return raw !== null ? true : undefined;
			},
			serialize: (value, out) => {
				if (value === true) {
					out.set('breakfastIncluded', '1');
				} else {
					out.delete('breakfastIncluded');
				}
			},
			resetPageOnChange: true
		},
		wheelchairAccessible: {
			parse: (raw) => {
				return raw !== null ? true : undefined;
			},
			serialize: (value, out) => {
				if (value === true) {
					out.set('wheelchairAccessible', '1');
				} else {
					out.delete('wheelchairAccessible');
				}
			},
			resetPageOnChange: true
		},
		audioGuideAvailable: {
			parse: (raw) => {
				return raw !== null ? true : undefined;
			},
			serialize: (value, out) => {
				if (value === true) {
					out.set('audioGuideAvailable', '1');
				} else {
					out.delete('audioGuideAvailable');
				}
			},
			resetPageOnChange: true
		},
		photographyAllowed: {
			parse: (raw) => {
				return raw !== null ? true : undefined;
			},
			serialize: (value, out) => {
				if (value === true) {
					out.set('photographyAllowed', '1');
				} else {
					out.delete('photographyAllowed');
				}
			},
			resetPageOnChange: true
		},
		smallGroup: {
			parse: (raw) => {
				return raw !== null ? true : undefined;
			},
			serialize: (value, out) => {
				if (value === true) {
					out.set('smallGroup', '1');
				} else {
					out.delete('smallGroup');
				}
			},
			resetPageOnChange: true
		}
	}
};
