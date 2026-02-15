import type { DestinationKind, DestinationSortAttribute } from '$core/destinations/enums';
import type { CriteriaOperator, CriteriaSortOption } from '$core/_shared/enums';

// --- Projections (read models) ---

export type DestinationParent = {
	id: string;
	descriptionLong: string | null;
	descriptionShort: string | null;
	kind: DestinationKind;
	latitude: number | null;
	longitude: number | null;
	name: string;
	photoUrl: string | null;
	photoUrlHero: string | null;
	slug: string;
};

export type Destination = {
	id: string;
	createdAt: string;
	descriptionLong: string | null;
	descriptionShort: string | null;
	kind: DestinationKind;
	latitude: number | null;
	longitude: number | null;
	name: string;
	parent: DestinationParent | null;
	photoUrl: string | null;
	photoUrlHero: string | null;
	slug: string;
};

// --- DTOs (write models) ---

export type DestinationCreateDto = {
	id: string;
	kind: DestinationKind;
	name: string;
	slug: string;
	parentId?: string | null;
	descriptionLong?: string | null;
	descriptionShort?: string | null;
	latitude?: number | null;
	longitude?: number | null;
	photoUrl?: string | null;
	photoUrlHero?: string | null;
};

export type DestinationUpdateDto = {
	parentId?: string | null;
	descriptionLong?: string | null;
	descriptionShort?: string | null;
	kind?: DestinationKind;
	name?: string;
	latitude?: number | null;
	longitude?: number | null;
	photoUrl?: string | null;
	photoUrlHero?: string | null;
	slug?: string;
};

// --- Criteria (query params) ---

export type DestinationCriteria = {
	page?: number;
	pageSize?: number;
	name?: string;
	query?: string;
	parentId?: string;
	kind?: DestinationKind;
	radius?: number;
	latitude?: number;
	longitude?: number;
	slug?: string;
	sort?: DestinationSortAttribute;
	operator?: CriteriaOperator;
	order?: CriteriaSortOption;
};
