// src/lib/types.ts

export type ActivityListItem = {
	id: string;
	slug: string;
	title: string;
	city: string;
	priceFrom: number;
	currency: string;
};

export type Pagination = {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
};

export type ActivityListResponse = {
	items: ActivityListItem[];
	pagination: Pagination;
};

export type ActivityDetail = ActivityListItem & {
	description: string;
	highlights: string[];
	meetingPoint: string;
	languages: string[];
	includes: string[];
	excludes: string[];
	cancellationPolicy: string;
};

export type Column<T> = {
	key: keyof T;
	label?: string;
};
