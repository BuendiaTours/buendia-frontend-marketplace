import type { DestinationKind } from '$api-destinations/enums';

export type { Destination, CriteriaResult } from '$lib/types';

export type DestinationsGetAllParams = {
	page?: number;
	pageSize?: number;
	q?: string;
	kind?: DestinationKind;
	wheelchairAccessible?: boolean;
	breakfastIncluded?: boolean;
	kidsFreeTour?: boolean;
	sort?: string;
	order?: 'asc' | 'desc';
};

export type DestinationsSearchParams = { q?: string };
