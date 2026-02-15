import type { TagSortAttribute } from '$core/tags/enums';
import type { CriteriaOperator, CriteriaSortOption } from '$core/_shared/enums';

// --- Projection (read model) ---

export type Tag = {
	id: string;
	name: string;
};

// --- DTOs (write models) ---

export type TagCreateDto = {
	id: string;
	name: string;
};

export type TagUpdateDto = {
	name: string;
};

// --- Criteria (query params) ---

export type TagCriteria = {
	page?: number;
	pageSize?: number;
	id?: string;
	name?: string;
	sort?: TagSortAttribute;
	operator?: CriteriaOperator;
	order?: CriteriaSortOption;
};
