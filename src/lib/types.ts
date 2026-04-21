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
	title?: string;
	description?: string;
	image?: string;
	itemsDescription?: string;
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

export type Faqs = {
	id: string;
	position: number;
	question: string;
	answer: string;
	status: string;
};

export type ContentBlockStack = {
	id: string;
	image: string;
	title: string;
	description: string;
};

export type RelatedPlansItem = {
	id: string;
	image: string;
	title: string;
	description: string;
	slug: string;
};

export type RelatedPlans = {
	title: string;
	items: RelatedPlansItem[];
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
	faqs: Faqs[];
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
	stagesTitle: string;
	stages: Array<{
		id: string;
		order: number;
		name: string;
		description?: string;
		kind: string;
		duration?: string;
	}>;
	status: ActivityStatus;
	tags: Array<{ id: string; name: string }>;
	transportKind: ActivityTransportKind;
	transportLocation: ActivityTransportLocation;
	voucherInfo: string | null;
	willDoing: string[];
	activityTickets: ActivityOption[];
	activityTicketsDisabled: ActivityOption[];
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
	stars?: number[];
};

export type ActivityReviewStatsDistribution = {
	stars: number;
	count: number;
	percentage: number;
};

export type ActivityReviewStats = {
	activityId: string;
	total: number;
	averageRating: number;
	distribution: ActivityReviewStatsDistribution[];
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

type ActivityOptionTicket = {
	id: string;
	price: number;
	discount: string;
	newPrice: number;
	commission: number;
	status: string;
	ageRange: { min: number; max: number };
	adultRequired: boolean;
	free: boolean;
	group: string;
	ticketNeeded: boolean;
};

export type ActivityOptionPickupLocation = {
	pickupPointId: string;
	kind: string;
	minutesBefore: number;
	name: string;
	address: string;
	city: string;
	postCode: string;
	countryCode: string;
	location: { type: 'Point'; coordinates: [number, number] } | null;
};

export type ActivityOption = {
	id: string;
	disabled: boolean;
	activityId: string;
	availabilityGroupId: string | null;
	title: string;
	totalTickets: number;
	description: string | null;
	supplierOptionCode: string;
	status: string;
	bookingSystem: string;
	privacy: string;
	language: string;
	wheelchair: string;
	ticketKind: string;
	skipTheLineType: string | null;
	maxGroupSize: number;
	maxTicketsPerIndividual: number;
	duration: { unit: string; quantity: number };
	audios: string[];
	brochures: string[];
	liveGuides: string[];
	individualTickets: ActivityOptionTicket[];
	groupTickets: ActivityOptionTicket[];
	pickupPlaces: ActivityOptionPickupLocation[];
	createdAt: string;
	updatedAt: string;
};

export type AvailabilityTicketItem = {
	id: string;
	price: number;
	stock: number | null;
	reservedStock: number | null;
};

export type AvailabilitySlot = {
	id: string;
	activityId: string;
	optionId: string;
	dateTime: string; // ISO-8601, e.g. "2026-04-09T10:00:00.000Z"
	availability: number;
	reservedAvailability: number;
	addons: unknown[];
	tickets: AvailabilityTicketItem[];
	createdAt: string;
	updatedAt: string;
};

export type AvailabilityData = AvailabilitySlot[];

export type ActivityCardInfoList = {
	id: string;
	infoName: string;
};

export type ActivityCard = {
	id: string;
	image: string;
	name: string;
	slug: string;
	kind?: string;
	infoList: ActivityCardInfoList[];
	cancellation?: string;
	price?: string;
	discount?: string;
	rating?: number;
	opinions?: number;
	isFreeTour?: boolean;
	isNew?: boolean;
	byBuendia?: boolean;
};

export type PlpAttractionItem = {
	id: string;
	image: string;
	title: string;
	slug: string;
	activities: number;
	price: number;
};

export type DestinationActivitiesResult = {
	data: ActivityCard[];
	pagination: {
		page: number;
		pageSize: number;
		total: number;
		totalPages: number;
	};
	filters?: Record<string, boolean>;
};

export type Column<T> = {
	key: keyof T;
	title?: string;
	sortable?: boolean;
	sortField?: string;
};

export type ApiImageVariant = {
	id: string;
	preset: string;
	format: string;
	width: number;
	height: number;
	sizeBytes: number;
	url?: string;
	normalizedCoords: {
		x: number;
		y: number;
		width: number;
		height: number;
		scale: number;
	};
};

export type ApiImage = {
	id: string;
	title: string;
	altText: string;
	mimeType: string;
	originalUrl: string;
	originalWidth: number;
	originalHeight: number;
	originalSizeBytes: number;
	modifications: {
		rotation: number;
		flipH: boolean;
		flipV: boolean;
	};
	variants: ApiImageVariant[];
	createdAt: string;
	updatedAt: string;
};

export type Destination = {
	activities: ActivityCard[];
	descriptionShort: string;
	id: string;
	image?: Partial<ApiImage>;
	kind: DestinationKind;
	name: string;
	slug: string;
	attractions: PlpAttractionItem[];
	faqsTitle?: string;
	faqs: Faqs[];
	contentBlockStack: ContentBlockStack[];
	relatedPlans: RelatedPlans;
	byBuendiaBanner: ByBuendiaBanner | null;
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

// --- Cart / Orders / Bookings ---

export type OrderStatus =
	| 'CART'
	| 'CHECKING_OUT'
	| 'PENDING_PAYMENT'
	| 'CONFIRMED'
	| 'COMPLETED'
	| 'PARTIALLY_COMPLETED'
	| 'FAILED'
	| 'EXPIRED';

export type BookingStatus =
	| 'PENDING'
	| 'CONFIRMED'
	| 'RETRYING'
	| 'FAILED'
	| 'CANCELLED'
	| 'CANCELLATION_FAILED'
	| 'EXPIRED';

export type PassengerAnswer = {
	questionId: string;
	description?: string;
	values: string[];
};

export type CartPassenger = {
	id: string;
	individualTicketId: string;
	group?: string;
	priceAtBooking?: number;
	unitCommission?: number;
	isMainPax: boolean;
	answers: PassengerAnswer[];
};

export type CartBooking = {
	id: string;
	orderId: string;
	activityId?: string;
	activityTitle?: string;
	optionId: string;
	optionTitle?: string;
	legibleId?: string;
	activityDatetime?: string;
	startTime?: string;
	date?: string;
	status: BookingStatus;
	subtotalPrice?: number;
	subtotalCommission?: number;
	passengers: CartPassenger[];
	addons: unknown[];
	bookingAnswers: PassengerAnswer[];
	pickupPoint?: unknown;
	dropoffPoint?: unknown;
	hotel?: unknown;
	createdAt?: string;
	updatedAt?: string;
};

export type CartOrder = {
	id: string;
	userId?: string;
	legibleId?: string;
	status: OrderStatus;
	currency?: string;
	totalAmount?: number;
	totalCommission?: number;
	contactEmail?: string;
	contactFirstName?: string;
	contactLastName?: string;
	contactPhone?: string;
	contactNationalityCountryCode?: string;
	bookings: CartBooking[];
	createdAt?: string;
	updatedAt?: string;
};

export type CreateOrderPayload = {
	id: string;
	userId?: string;
	booking: {
		id: string;
		optionId: string;
		activityDatetime: string;
		passengers: Array<{ id: string; individualTicketId: string }>;
	};
};

export type AddBookingPayload = {
	id: string;
	optionId: string;
	activityDatetime: string;
	passengers: Array<{ id: string; individualTicketId: string }>;
};

export type PassengerLineItem = {
	group: string;
	count: number;
	unitPrice: number;
};

export type BookingQuestionDataType =
	| 'CHECKBOX'
	| 'BOOLEAN'
	| 'INPUT_TEXT'
	| 'TEXT_AREA'
	| 'INPUT_NUMBER'
	| 'DATE'
	| 'DATE_AND_TIME'
	| 'PHONE'
	| 'EMAIL'
	| 'BIRTHDAY'
	| 'COUNTRY'
	| 'LANGUAGE'
	| 'AGE'
	| 'GENDER'
	| 'PASSPORT'
	| 'PASSPORT_EXPIRED'
	| 'OPTION'
	| 'MULTI_OPTION'
	| 'CHECK_TERMS'
	| 'RADIO_BUTTON';
export type BookingQuestionRequired = 'REQUIRED' | 'NOT_REQUIRED';
export type BookingQuestionTarget = 'BOOKING' | 'PASSENGER' | 'EXTRA';
export type PassengerGroup =
	| 'ADULT'
	| 'CHILD'
	| 'CITIZEN_EU'
	| 'INFANT'
	| 'SENIOR'
	| 'STUDENT'
	| 'STUDENT_EU'
	| 'YOUTH';

export type BookingQuestionOption = {
	id: string;
	label: string;
	value: string;
};

export type BookingQuestion = {
	id: string;
	activityId: string;
	dataType: BookingQuestionDataType;
	label: string;
	required: BookingQuestionRequired;
	status: 'ACTIVE';
	target: BookingQuestionTarget;
	groupAge: PassengerGroup[] | null;
	helpText: string | null;
	placeholder: string | null;
	defaultValue: string | null;
	minValue: number | null;
	maxValue: number | null;
	options: BookingQuestionOption[];
	activityOptions: { id: string; name: string }[];
	createdAt: string;
	updatedAt: string;
};
