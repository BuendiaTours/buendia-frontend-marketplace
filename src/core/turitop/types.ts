/**
 * @module turitop/types
 * @description TypeScript type definitions for the TuriTop booking system integration.
 * Covers products, tickets, and their mappings to core entities.
 */

// ── Ticket ──────────────────────────────────────

/** A TuriTop ticket as returned by the booking system API. */
export type TuritopTicket = {
	turitopId: string;
	coreTicketId: string | null;
	name: string;
	price: number;
	currency: string;
	ticketsMax: number;
	ticketsMin: number;
	seats: number;
	displayOrder: number;
	visibility: string;
	isAddon: boolean;
	required: boolean;
	ticketNotes: string | null;
	ticketScope: 'INDIVIDUAL' | 'GROUP';
};

/** Payload for mapping a TuriTop product to a core option. */
export type TuritopProductMappingDto = {
	coreId: string;
	tenant: string;
};

/** Payload for mapping a TuriTop ticket to a core ticket. */
export type TuritopTicketMappingDto = {
	coreId: string;
	ticketScope: 'INDIVIDUAL' | 'GROUP';
};

/** Payload for resetting a TuriTop mapping. */
export type TuritopResetMappingDto = {
	bookingSystem: string;
	bookingSystemId: string;
	tenant: string;
};

// ── Product (aggregated response) ───────────────

/** The aggregated TuriTop product data returned by the booking system API. */
export type TuritopProduct = {
	id: string;
	shortId: string;
	tenant: string;
	coreId: string | null;
	name: string;
	tickets: TuritopTicket[];
};
