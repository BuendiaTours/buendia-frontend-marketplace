// src/lib/types.ts
import type {
	ActivityNotSuitableFor,
	ActivityStatus,
	ActivityKind,
	ActivityGuideKind,
	ActivityTransportKind,
	ActivityTransportLocation
} from '$core/activities/enums';
import type { DestinationKind } from '$core/destinations/enums';
import type { AttractionStatus } from '$core/attractions/enums';

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
	guideKind: ActivityGuideKind;
	included: string[];
	infoImportant: string | null;
	itemsToBring: string[];
	kind: ActivityKind;
	meals: string[];
	multimedias: string[];
	notSuitableFor: Array<ActivityNotSuitableFor>;
	petsAllowed: {
		allowed: string;
		description: string | null;
	};
	phoneContact: string | null;
	restrictions: string[];
	stages: string[];
	status: ActivityStatus;
	tags: Array<{ id: string; name: string }>;
	transportKind: ActivityTransportKind;
	transportLocation: ActivityTransportLocation;
	voucherInfo: string | null;
	willDoing: string[];
};

// Re-export from API shared types (canonical location)
export type { CriteriaResult } from '$core/_shared/types';

export type ActivityDetail = ActivityListItem & {
	cancellationPolicy: string;
	description: string;
	excludes: string[];
	highlights: string[];
	includes: string[];
	languages: string[];
	meetingPoint: string;
};

type ReviewAttachment = {
	url: { value: string };
	mimeType: string | null;
};

type ReviewAttributeRating = {
	attributeKey: string;
	rating: number;
};

export type ReviewReply = {
	id: string;
	author: string;
	content: string;
	createdAt: string;
};

export type ActivityReview = {
	id: string;
	activityId: string;
	attachments: ReviewAttachment[];
	attributeRatings: ReviewAttributeRating[];
	averageRating: number;
	content: string;
	createdAt: string;
	user: string;
	replies: ReviewReply[];
};

export type Column<T> = {
	key: keyof T;
	title?: string;
	sortable?: boolean;
	sortField?: string;
};

export type Destination = {
	id: string;
	name: string;
	slug: string;
	kind: DestinationKind;
	descriptionShort: string;
	photoUrlHero: string;
};

export type Attraction = {
	id: string;
	name: string;
	slug: string;
	status?: AttractionStatus;
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

export type BreadcrumbItem = {
	label: string;
	href?: string;
};

export type BreadcrumbConfig = BreadcrumbItem[];
