// src/lib/types.ts

export type ActivityListItem = {
	id: string;
	title: string;
	slug: string;
	attractions: Array<{ id: string; name: string }>;
	categories: Array<{ id: string; name: string }>;
	codeRef: string;
	descriptionFull: string;
	descriptionShort: string;
	destinations: Array<{ id: string; name: string }>;
	distributives: Array<{ id: string; name: string }>;
	excluded: string[];
	guideKind: string;
	included: string[];
	infoImportant: string | null;
	itemsToBring: string[];
	kind: string;
	meals: string[];
	multimedias: string[];
	notSuitableFor: Array<'ADULTS' | 'CHILDREN' | 'FAMILIES' | 'GROUPS' | 'INDIVIDUALS'>;
	petsAllowed: {
		allowed: string;
		description: string | null;
	};
	phoneContact: string | null;
	restrictions: string[];
	stages: string[];
	status: string;
	tags: Array<{ id: string; name: string }>;
	transportKind: string;
	transportLocation: string;
	voucherInfo: string | null;
	willDoing: string[];
};

export type ActivityListResponse = {
	data: ActivityListItem[];
	pagination: Pagination;
};

export type ActivityDetail = ActivityListItem & {
	cancellationPolicy: string;
	description: string;
	excludes: string[];
	highlights: string[];
	includes: string[];
	languages: string[];
	meetingPoint: string;
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
	postalAddress?: string;
	destinations?: Array<{
		id: string;
		name: string;
	}>;
	location?: {
		// GeoJSON Point
		type: 'Point';
		coordinates: [number, number];
	} | null;
};

export type Pagination = {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
};

export interface BreadcrumbItem {
	label: string;
	href?: string;
}

export type BreadcrumbConfig = BreadcrumbItem[];
