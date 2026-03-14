/**
 * Google Maps API loader using the official @googlemaps/js-api-loader functional API.
 * Calls setOptions() once, then importLibrary() for each library needed.
 */

import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

let configured = false;

function ensureConfigured(apiKey: string): void {
	if (configured) return;
	setOptions({ key: apiKey, v: 'weekly' });
	configured = true;
}

/** Load the Maps core library. Returns the Map class ready to use. */
export async function loadMapsLibrary(apiKey: string): Promise<google.maps.MapsLibrary> {
	ensureConfigured(apiKey);
	return importLibrary('maps') as Promise<google.maps.MapsLibrary>;
}

/** Load the Marker library. Returns AdvancedMarkerElement ready to use. */
export async function loadMarkerLibrary(apiKey: string): Promise<google.maps.MarkerLibrary> {
	ensureConfigured(apiKey);
	return importLibrary('marker') as Promise<google.maps.MarkerLibrary>;
}

/** Load the Geocoding library. Returns the Geocoder class ready to use. */
export async function loadGeocodingLibrary(apiKey: string): Promise<google.maps.GeocodingLibrary> {
	ensureConfigured(apiKey);
	return importLibrary('geocoding') as Promise<google.maps.GeocodingLibrary>;
}
