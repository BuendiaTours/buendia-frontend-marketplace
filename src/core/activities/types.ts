export type { ActivityListItem, CriteriaResult } from '$lib/types';

export type ActivitiesGetAllParams = {
	page?: number;
	pageSize?: number;
	from?: string;
	to?: string;
	destination?: string;
	kind?: string;
	status?: string;
	isFreeTour?: boolean;
	freeForKids?: boolean;
	breakfast?: boolean;
	wheelchairAccessible?: boolean;
	sort?: string;
	order?: 'asc' | 'desc';
};
