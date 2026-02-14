import type { AttractionStatus } from '$core/attractions/enums';
import type { CriteriaSortOption } from '$core/_shared/enums';

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
	order?: CriteriaSortOption;
};

export type AttractionsSearchParams = { q?: string };
