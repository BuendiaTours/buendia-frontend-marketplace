/**
 * @module users/types
 * @description TypeScript type definitions for the Users resource.
 * Organised into Projections (read), DTOs (write), and Criteria (query).
 */

import type { UserKind, UserRole, UserStatus, UserSortAttribute } from '$core/users/enums';
import type { CriteriaOperator, CriteriaSortOption } from '$core/_shared/enums';

// ── Projection (read model) ─────────────────────

/** Full user projection as returned by the API. */
export type User = {
	id: string;
	email: string;
	name: string;
	phone: string;
	kind: UserKind;
	status: UserStatus;
	roles: UserRole[];
};

// ── DTOs (write models) ─────────────────────────

/** Payload for creating a new user (status and roles are assigned server-side). */
export type UserCreateDto = Omit<User, 'status' | 'roles'>;

/** Payload for partially updating an existing user. */
export type UserUpdateDto = Partial<Omit<User, 'id'>>;

// ── Criteria (query params) ─────────────────────

/** Query parameters for filtering, sorting, and paginating user lists. */
export type UserCriteria = {
	skip?: number;
	limit?: number;
	email?: string;
	kind?: UserKind;
	operator?: CriteriaOperator;
	order?: CriteriaSortOption;
	phone?: string;
	search_text?: string;
	sort?: UserSortAttribute;
	status?: UserStatus;
};
