/**
 * Reactive controller for Google Maps with AdvancedMarkerElement.
 * Uses the official @googlemaps/js-api-loader functional API for reliable async loading.
 *
 * Designed to be used with a Svelte 5 component: exposes $state fields for
 * the template to read, and a callback to write coordinates back to the parent.
 */

import { env } from '$env/dynamic/public';
import * as m from '$paraglide/messages';
import { loadMapsLibrary, loadMarkerLibrary, loadGeocodingLibrary } from '$lib/utils/googleMaps';
import {
	DEFAULT_COORDINATES,
	DEFAULT_GEOJSON_CONFIG,
	coordsEqual,
	type FormGeoJsonConfig,
	type GeoJsonPoint
} from '$lib/utils/googleMapsTypes';

type ControllerOptions = {
	onCoordinatesChange: (point: GeoJsonPoint) => void;
};

type InitOptions = {
	container: HTMLDivElement;
	id: string;
	config: Partial<FormGeoJsonConfig>;
};

export class GoogleMapController {
	/** Whether the map has been fully initialized and is ready for interaction. */
	isLoaded = $state(false);
	/** Initialization error message, shown to the user when the map fails to load. */
	error = $state<string | null>(null);
	/** Whether a geocoding search is currently in progress. */
	isSearching = $state(false);
	/** Error message from the last geocoding search attempt. */
	searchError = $state<string | null>(null);

	private map: google.maps.Map | null = null;
	private marker: google.maps.marker.AdvancedMarkerElement | null = null;
	private listeners: google.maps.MapsEventListener[] = [];
	private onCoordinatesChange: (point: GeoJsonPoint) => void;
	/** Tracks the last coordinates written by the controller to prevent $effect loops. */
	private lastWritten: [number, number] | undefined;
	/** Prevents async init from completing after destroy has been called. */
	private destroyed = false;

	constructor(options: ControllerOptions) {
		this.onCoordinatesChange = options.onCoordinatesChange;
	}

	/**
	 * Load Google Maps libraries and render the map inside the given container.
	 * Safe to call multiple times — resets internal state on each call.
	 */
	async init({ container, id, config }: InitOptions): Promise<void> {
		this.destroyed = false;
		this.error = null;

		const apiKey = env.PUBLIC_GOOGLE_MAPS_API_KEY;
		if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
			this.error = m.geoJson_configureApiKeyEnv();
			return;
		}

		const cfg = { ...DEFAULT_GEOJSON_CONFIG, ...config };

		try {
			const [mapsLib, markerLib] = await Promise.all([
				loadMapsLibrary(apiKey),
				loadMarkerLibrary(apiKey)
			]);

			if (this.destroyed) return;

			const initialPosition = { lat: DEFAULT_COORDINATES[1], lng: DEFAULT_COORDINATES[0] };

			this.map = new mapsLib.Map(container, {
				center: initialPosition,
				zoom: cfg.defaultZoom,
				mapTypeControl: cfg.mapTypeControl,
				streetViewControl: cfg.streetViewControl,
				fullscreenControl: cfg.fullscreenControl,
				mapId: `map-${id}`
			});

			this.marker = new markerLib.AdvancedMarkerElement({
				position: initialPosition,
				map: this.map,
				title: m.geoJson_markerTitle(),
				gmpDraggable: true
			});

			this.listeners.push(
				this.marker.addListener('dragend', () => {
					const pos = this.marker?.position;
					if (!pos) return;
					const ll = this.toLatLngLiteral(pos);
					if (ll) this.writeCoordinates(ll.lng, ll.lat);
				})
			);

			this.listeners.push(
				this.map.addListener('click', (e: google.maps.MapMouseEvent) => {
					if (e.latLng && this.marker) {
						this.marker.position = { lat: e.latLng.lat(), lng: e.latLng.lng() };
						this.writeCoordinates(e.latLng.lng(), e.latLng.lat());
					}
				})
			);

			this.isLoaded = true;
		} catch (err) {
			console.error('Error initializing Google Maps:', err);
			this.error = err instanceof Error ? err.message : m.geoJson_mapLoadError();
		}
	}

	/**
	 * Sync the map position from an external GeoJSON value (e.g. parent form state).
	 * Skips the update if the coordinates match the last value written by this controller,
	 * preventing infinite $effect loops.
	 */
	syncFromValue(value: GeoJsonPoint | null): void {
		if (!this.isLoaded || !this.map || !this.marker) return;

		const coords = value?.coordinates;
		if (!coords) return;
		if (coordsEqual(coords, this.lastWritten)) return;

		const position = { lat: coords[1], lng: coords[0] };
		this.marker.position = position;
		this.map.setCenter(position);
	}

	/**
	 * Geocode a text query and move the map/marker to the first result.
	 * Clears searchError on success; sets it with an i18n message on failure.
	 */
	async searchLocation(query: string): Promise<void> {
		if (!query.trim()) return;

		this.isSearching = true;
		this.searchError = null;

		try {
			const apiKey = env.PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
			const { Geocoder } = await loadGeocodingLibrary(apiKey);
			const geocoder = new Geocoder();
			const response = await geocoder.geocode({ address: query });

			if (response.results.length > 0 && response.results[0].geometry?.location) {
				const location = response.results[0].geometry.location;
				this.setPosition(location.lng(), location.lat());
				this.map?.setZoom(13);
			}
		} catch (err: unknown) {
			console.error('Error searching location:', err);
			this.searchError = this.geocodeErrorToMessage(err);
		} finally {
			this.isSearching = false;
		}
	}

	/**
	 * Set coordinates from an external source (e.g. manual lat/lng input),
	 * move the marker and center the map, and notify the parent.
	 */
	setPosition(lng: number, lat: number): void {
		const coords: [number, number] = [Number(lng.toFixed(6)), Number(lat.toFixed(6))];
		this.lastWritten = coords;
		this.onCoordinatesChange({ type: 'Point', coordinates: coords });

		if (this.marker && this.map) {
			const position = { lat: coords[1], lng: coords[0] };
			this.marker.position = position;
			this.map.setCenter(position);
		}
	}

	/** Clean up map resources and event listeners. */
	destroy(): void {
		this.destroyed = true;

		for (const listener of this.listeners) {
			listener.remove();
		}
		this.listeners = [];

		if (this.marker) {
			this.marker.map = null;
			this.marker = null;
		}
		this.map = null;
		this.isLoaded = false;
	}

	/** Normalize a LatLng | LatLngLiteral union into a plain literal. */
	private toLatLngLiteral(
		pos: google.maps.LatLng | google.maps.LatLngLiteral
	): google.maps.LatLngLiteral {
		if (typeof (pos as google.maps.LatLng).lat === 'function') {
			const ll = pos as google.maps.LatLng;
			return { lat: ll.lat(), lng: ll.lng() };
		}
		return pos as google.maps.LatLngLiteral;
	}

	/** Write coordinates to parent without moving the marker (used by map/marker events). */
	private writeCoordinates(lng: number, lat: number): void {
		const coords: [number, number] = [Number(lng.toFixed(6)), Number(lat.toFixed(6))];
		this.lastWritten = coords;
		this.onCoordinatesChange({ type: 'Point', coordinates: coords });
	}

	/** Map a Geocoder error to an i18n user-facing message. */
	private geocodeErrorToMessage(err: unknown): string {
		const code = (err as { code?: string })?.code;
		switch (code) {
			case 'REQUEST_DENIED':
				return m.geoJson_searchErrorDenied();
			case 'ZERO_RESULTS':
				return m.geoJson_searchErrorNotFound();
			case 'OVER_QUERY_LIMIT':
				return m.geoJson_searchErrorOverLimit();
			case 'INVALID_REQUEST':
				return m.geoJson_searchErrorInvalidRequest();
			default:
				return m.geoJson_searchErrorNotFound();
		}
	}
}
