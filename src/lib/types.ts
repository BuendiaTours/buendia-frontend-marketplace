// src/lib/types.ts

export type ActivityListItem = {
	id: string;
	title: string;
	thumb: string;
	location: string;
	duration: {
		text: string;
		minutes: number;
	};
	rating: number | null;
	reviews: number | null;
	price: {
		currency: string;
		from: number;
	};
	badges: string[];
	isFreeTour: 0 | 1;
	slug: string;
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
	title?: string;
	sortable?: boolean;
};

export type Location = {
	id: string;
	name: string;
	slug: string;
};
