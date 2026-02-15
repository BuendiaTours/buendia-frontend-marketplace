import type { DistributiveSortAttribute } from '$core/distributives/enums';
import type { CriteriaOperator, CriteriaSortOption } from '$core/_shared/enums';

// --- Projections (read models) ---

export type DistributiveCategory = {
	id: string;
	name: string;
};

export type DistributiveDestination = {
	id: string;
	name: string;
};

export type Distributive = {
	id: string;
	category: DistributiveCategory;
	destination: DistributiveDestination;
	name: string;
	photoUrl: string;
	photoUrlHero: string | null;
	slug: string;
};

// --- DTOs (write models) ---

export type DistributiveCreateDto = {
	id: string;
	categoryId: string;
	destinationId: string;
	name: string;
	photoUrl: string;
	slug: string;
	photoUrlHero?: string;
};

export type DistributiveUpdateDto = {
	name?: string;
	photoUrl?: string;
	photoUrlHero?: string | null;
	slug?: string;
};

// --- Criteria (query params) ---

export type DistributiveCriteria = {
	page?: number;
	pageSize?: number;
	name?: string;
	search?: string;
	slug?: string;
	sort?: DistributiveSortAttribute;
	operator?: CriteriaOperator;
	order?: CriteriaSortOption;
};
