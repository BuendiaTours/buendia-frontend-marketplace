/**
 * @module distributives/types
 * @description TypeScript type definitions for the Distributives resource.
 */

/** A distributive search result item as returned by the Elasticsearch search endpoint. */
export type DistributiveSearchItem = {
	id: string;
	name: string;
	slug: string;
	thumbnailUrl: string | null;
	cardImageUrl: string | null;
	locations: Array<{ id: string; name: string; role: string }>;
	activitiesTotal: number;
};

/** Wrapper returned by GET /distributives/search for each hit. */
export type DistributiveSearchResult = {
	item: DistributiveSearchItem;
	score: number | null;
};

/** Full response shape from GET /distributives/search. */
export type DistributiveSearchResponse = {
	data: DistributiveSearchResult[];
	total: number;
};
