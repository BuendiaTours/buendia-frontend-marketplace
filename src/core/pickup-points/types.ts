/**
 * @module pickup-points/types
 * @description TypeScript types for the Pickup Points resource.
 * Includes projections (read models), DTOs (write payloads), and criteria (query params).
 */

import type { CriteriaOperator, CriteriaSortOption } from '$core/_shared/enums';
import type { Coords } from '$core/_shared/types';
import type { PickupPointSort } from '$core/pickup-points/enums';

// ── Projections (read models) ───────────────────

/** Hotel embedded in a pickup point projection. */
export type PickupPointHotel = {
	id: number;
	minutesBefore: number | null;
	name: string;
};

/** Read-only projection of a pickup point. */
export type PickupPoint = {
	id: string;
	address: string | null;
	city: string | null;
	coords: Coords | null;
	countryCode: string | null;
	createdAt: string;
	hotels: PickupPointHotel[];
	name: string;
	postCode: string | null;
	updatedAt: string;
};

// ── DTOs (write payloads) ───────────────────────

/** Hotel payload for create/update operations. */
export type PickupPointHotelDto = {
	id: number;
	name: string;
	minutesBefore?: number | null;
};

/** Payload for creating a pickup point. */
export type PickupPointCreateDto = {
	id?: string;
	address?: string | null;
	city?: string | null;
	coords?: Coords | null;
	countryCode?: string | null;
	hotels?: PickupPointHotelDto[];
	name: string;
	postCode?: string | null;
};

/** Payload for updating a pickup point. All fields optional. */
export type PickupPointUpdateDto = {
	address?: string | null;
	city?: string | null;
	coords?: Coords | null;
	countryCode?: string | null;
	hotels?: PickupPointHotelDto[];
	name?: string;
	postCode?: string | null;
};

// ── Criteria (query params) ─────────────────────

/** Query parameters for filtering, sorting, and paginating pickup point lists. */
export type PickupPointCriteria = {
	id?: string;
	city?: string;
	countryCode?: string;
	limit?: number;
	name?: string;
	operator?: CriteriaOperator;
	order?: CriteriaSortOption;
	skip?: number;
	sort?: PickupPointSort;
};
