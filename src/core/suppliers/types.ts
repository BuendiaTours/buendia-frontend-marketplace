/**
 * @module suppliers/types
 * @description TypeScript type definitions for the Suppliers resource.
 * Organised into Projections (read), DTOs (write), and Criteria (query).
 */

import type { SupplierSortAttribute, SupplierStatus } from '$core/suppliers/enums';
import type { CriteriaOperator, CriteriaSortOption } from '$core/_shared/enums';

// -- Projection (read model) -----------------

/** Full supplier projection as returned by the API. */
export type Supplier = {
	id: string;
	aboutUs: string;
	companyName: string;
	email: string;
	logoUrl: string;
	name: string;
	ownerFullName: { firstName: string; lastName: string };
	phone: string;
	postalAddress: string;
	slug: string;
	status: SupplierStatus;
	vat: string;
	createdAt: string;
	updatedAt: string;
};

// -- DTOs (write models) ---------------------

/** Payload for creating a new supplier. */
export type SupplierCreateDto = {
	id: string;
	aboutUs: string;
	companyName: string;
	email: string;
	logoUrl: string;
	name: string;
	ownerFirstName: string;
	ownerLastName: string;
	phone: string;
	postalAddress: string;
	slug: string;
	status: SupplierStatus;
	vat: string;
};

/** Payload for partially updating an existing supplier. */
export type SupplierUpdateDto = {
	aboutUs?: string;
	companyName?: string;
	email?: string;
	logoUrl?: string;
	name?: string;
	ownerFirstName?: string;
	ownerLastName?: string;
	phone?: string;
	postalAddress?: string;
	slug?: string;
	status?: SupplierStatus;
	vat?: string;
};

// -- Criteria (query params) -----------------

/** Query parameters for filtering, sorting, and paginating supplier lists. */
export type SupplierCriteria = {
	limit?: number;
	name?: string;
	operator?: CriteriaOperator;
	order?: CriteriaSortOption;
	search_text?: string;
	skip?: number;
	sort?: SupplierSortAttribute;
	status?: SupplierStatus;
	vat?: string;
};
