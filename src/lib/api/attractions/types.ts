import type { AttractionStatus } from '$api-attractions/enums';

export type { Attraction, CriteriaResult } from '$lib/types';

export type AttractionsGetAllParams = {
	page?: number;
	pageSize?: number;
	q?: string;
	status?: AttractionStatus;
	wheelchairAccessible?: boolean;
	breakfastIncluded?: boolean;
	kidsFreeTour?: boolean;
	sort?: string;
	order?: 'asc' | 'desc';
};

export type AttractionsSearchParams = { q?: string };
