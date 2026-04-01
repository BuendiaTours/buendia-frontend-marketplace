/**
 * @module bokun/types
 * @description TypeScript type definitions for the Bokun booking system integration.
 * Covers rates, pricing categories, and their mappings to core entities.
 */

// ── Rate ────────────────────────────────────────

/** A Bokun rate as returned in the top-level `rates` array. */
export type BokunRate = {
	id: number;
	coreOptionId: string | null;
	rateTitle: string;
	rateIndex: number;
	pricedPerPerson: boolean;
	minPerBooking: number;
	maxPerBooking: number;
	startTimeIds: number[] | null;
	tieredPricingEnabled: boolean;
	cancellationPolicyTitle: string;
	cancellationPolicyPolicyType: string;
};

/** A Bokun rate from rawData, which includes pricingCategoryIds. */
export type BokunRawRate = {
	id: number;
	title: string;
	index: number;
	pricingCategoryIds: number[];
};

/** Payload for mapping a Bokun rate to a core option. */
export type BokunRateMappingDto = {
	coreId: string;
};

// ── Pricing Category ────────────────────────────

/** A Bokun pricing category from rawData.pricingCategories. */
export type BokunPricingCategory = {
	id: number;
	title: string;
	fullTitle: string;
	minAge: number;
	maxAge: number;
	ticketCategory: string;
	defaultCategory: boolean;
};

/** A Bokun pricing category mapping as returned by the activity endpoint. */
export type BokunPricingCategoryMapping = {
	pricingCategoryId: number;
	rateId: number;
	bokunActivityId: number;
	coreTicketId: string | null;
	ticketScope: 'INDIVIDUAL' | 'GROUP';
	pricingCategory: {
		id: number;
		pricingCategoryTitle: string;
		ticketCategory: string;
		minAge: number;
		maxAge: number;
		defaultCategory: boolean;
	};
};

/** Payload for mapping a Bokun pricing category to a core ticket. */
export type BokunPricingCategoryMappingDto = {
	coreId: string;
	activityId: number;
	rateId: number;
	ticketScope: 'INDIVIDUAL' | 'GROUP';
};

// ── Booking System Activity (aggregated response) ─

/** The aggregated Bokun activity data returned by the booking system API. */
export type BokunActivity = {
	id: number;
	defaultRateId: number;
	rates: BokunRate[];
	rawData: {
		rates: BokunRawRate[];
		pricingCategories: BokunPricingCategory[];
	};
};
