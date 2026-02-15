import type { CategoryKind, CategorySortAttribute, CategoryStatus } from '$core/categories/enums';
import type { CriteriaOperator, CriteriaSortOption } from '$core/_shared/enums';

// --- Projection (read model) ---

export type Category = {
	id: string;
	createdAt: string;
	description: string | null;
	kind: CategoryKind;
	label: string | null;
	name: string;
	slug: string;
	status: CategoryStatus;
	updatedAt: string;
};

// --- DTOs (write models) ---

export type CategoryCreateDto = {
	id: string;
	kind: CategoryKind;
	name: string;
	slug: string;
	status: CategoryStatus;
	description?: string | null;
	label?: string | null;
};

export type CategoryUpdateDto = {
	description?: string | null;
	kind?: CategoryKind;
	label?: string | null;
	name?: string;
	slug?: string;
	status?: CategoryStatus;
};

// --- Criteria (query params) ---

export type CategoryCriteria = {
	page?: number;
	pageSize?: number;
	name?: string;
	query?: string;
	slug?: string;
	status?: CategoryStatus;
	sort?: CategorySortAttribute;
	operator?: CriteriaOperator;
	order?: CriteriaSortOption;
};
