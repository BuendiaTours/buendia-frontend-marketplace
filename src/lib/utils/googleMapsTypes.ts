/** Shared types and defaults for Google Maps GeoJSON components */

export type GeoJsonPoint = {
	type: 'Point';
	coordinates: [number, number]; // [longitude, latitude]
};

export type FormGeoJsonConfig = {
	showSearchBox: boolean;
	showCoordinatesDisplay: boolean;
	enableGeocoding: boolean;
	defaultZoom: number;
	mapTypeControl: boolean;
	streetViewControl: boolean;
	fullscreenControl: boolean;
};

export const DEFAULT_GEOJSON_CONFIG: FormGeoJsonConfig = {
	showSearchBox: false,
	showCoordinatesDisplay: true,
	enableGeocoding: true,
	defaultZoom: 13,
	mapTypeControl: true,
	streetViewControl: false,
	fullscreenControl: false
};

/** Default coordinates: center of Spain */
export const DEFAULT_COORDINATES: [number, number] = [-3.7038, 40.4168];

/** Epsilon for floating point comparison to prevent reactivity loops */
const COORD_EPSILON = 0.000001;

/** Compare two coordinate pairs within epsilon tolerance */
export function coordsEqual(
	a: [number, number] | undefined,
	b: [number, number] | undefined
): boolean {
	if (!a || !b) return a === b;
	return Math.abs(a[0] - b[0]) < COORD_EPSILON && Math.abs(a[1] - b[1]) < COORD_EPSILON;
}
