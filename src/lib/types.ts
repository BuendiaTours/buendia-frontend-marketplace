// src/lib/types.ts

export type ActivityListItem = {
	id: string;
	title: string;
	slug: string;
	codeRef: string;
	descriptionShort: string;
	descriptionFull: string;
	infoImportant: string | null;
	kind: string;
	status: string;
	phoneContact: string | null;
	guideKind: string;
	transportKind: string;
	transportLocation: string;
	voucherInfo: string | null;
	attractions: Array<{ id: string; name: string }>;
	categories: Array<{ id: string; name: string }>;
	destinations: Array<{ id: string; name: string }>;
	distributives: Array<{ id: string; name: string }>;
	tags: Array<{ id: string; name: string }>;
	included: string[];
	excluded: string[];
	itemsToBring: string[];
	restrictions: string[];
	notSuitableFor: string[];
	willDoing: string[];
	meals: string[];
	stages: string[];
	multimedias: string[];
	petsAllowed: {
		allowed: string;
		description: string | null;
	};
};

export type Pagination = {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
};

export type ActivityListResponse = {
	data: ActivityListItem[];
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

export type Destination = {
	id: string;
	name: string;
	slug: string;
	kind: 'CITY' | 'REGION' | 'COUNTRY';
	descriptionShort: string;
	photoUrlHero: string;
};

export type Attraction = {
	id: string;
	name: string;
	slug: string;
	status?: 'ACTIVE' | 'DRAFT' | 'INACTIVE';
	description?: string;
	descriptionLong?: string;
	photoUrl?: string;
	photoUrlHero?: string;
};
