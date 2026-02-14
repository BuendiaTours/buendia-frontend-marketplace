import type { DestinationKind } from '$core/destinations/enums';
import type { CriteriaSortOption } from '$core/_shared/enums';

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
	order?: CriteriaSortOption;
};

export type DestinationsSearchParams = { q?: string };
