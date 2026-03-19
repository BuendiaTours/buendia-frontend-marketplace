// src/lib/types.ts
import type { Component, Snippet } from 'svelte';
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

export type ByBuendiaBannerItem = {
	id: string;
	icon?: string;
	title?: string;
	description?: string;
};

export type ByBuendiaBanner = {
	title: string;
	description: string;
	items: ByBuendiaBannerItem[];
	link: {
		text: string;
		src: string;
	};
};

export type ConditionItem = {
	id: string;
	icon: string;
	title: string;
	description: string;
};

export type Condition = {
	id: string;
	style: string;
	items: ConditionItem[];
};

export type ActivityListItem = {
	id: string;
	title: string;
	slug: string;
	attractions: Array<{ id: string; name: string }>;
	categories: Array<{ id: string; name: string }>;
	codeRef: string;
	conditions: Condition[];
	conditionsTitle: string | null;
	descriptionFull: string;
	descriptionShort: string;
	destinations: Array<{ id: string; name: string }>;
	distributives: Array<{ id: string; name: string }>;
	excluded: string[];
	faqs: Array<{ id: string; position: number; question: string; answer: string; status: string }>;
	byBuendiaBanner: ByBuendiaBanner | null;
	highlights: Array<{ id: string; icon: string; text: string; itsLevel?: boolean }>;
	guideKind: ActivityGuideKind;
	included: string[];
	infoImportant: string | null;
	itemsToBring: string[];
	kind: ActivityKind;
	meals: string[];
	multimedias: MultimediaItem[];
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

export type ActivityReviewParams = {
	sort?: 'averageRating' | 'createdAt';
	order?: 'ASC' | 'DESC';
	page?: number;
	pageSize?: number;
};

export type ActivityReviewsResponse = {
	data: ActivityReview[];
	pagination: {
		page: number;
		pageSize: number;
		total: number;
		totalPages: number;
	};
	sort: {
		field: string;
		order: 'asc' | 'desc';
	};
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

export type MultimediaItem = {
	id: string;
	title: string;
	altText: string;
	mimeType: string;
	originalUrl: string;
	originalWidth: number;
	originalHeight: number;
	modifications: {
		rotation: number;
		flipH: boolean;
		flipV: boolean;
	};
	variants: Array<{
		id: string;
		preset: string;
		format: string;
		width: number;
		height: number;
		url: string;
		sizeBytes: number;
	}>;
	createdAt: string;
	updatedAt: string;
};

export type BreadcrumbConfig = BreadcrumbItem[];

// --- BndLightbox ---

export type BndLightboxItem = {
	src: string;
	alt?: string;
	title?: string;
	meta?: Record<string, unknown>;
};

export type BndLightboxItemContext = {
	item: BndLightboxItem;
	index: number;
	total: number;
};

export type BndLightboxCategory = {
	id: string;
	label: string;
	items: BndLightboxItem[];
	/** Inline one-off layout defined with {#snippet} in the consuming page */
	layout?: Snippet<[BndLightboxItemContext]>;
	/** Reusable layout component imported from BndLightbox/layouts/ */
	layoutComponent?: Component<{ ctx: BndLightboxItemContext }>;
};

export type BndLightboxConfig = {
	categories: BndLightboxCategory[];
	wrapAround?: boolean;
	showTitle?: boolean;
	startCategory?: string;
	startIndex?: number;
};
