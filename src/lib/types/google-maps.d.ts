// Tipos básicos para Google Maps API
declare global {
	interface Window {
		google: typeof google;
	}
}

declare namespace google.maps {
	export class Map {
		constructor(mapDiv: HTMLElement, opts?: MapOptions);
		setCenter(latlng: LatLng | LatLngLiteral): void;
		setZoom(zoom: number): void;
		getZoom(): number;
		addListener(eventName: string, handler: Function): void;
	}

	export class Marker {
		constructor(opts?: MarkerOptions);
		setPosition(latlng: LatLng | LatLngLiteral): void;
		getPosition(): LatLng | null;
		addListener(eventName: string, handler: Function): void;
	}

	export class LatLng {
		constructor(lat: number, lng: number);
		lat(): number;
		lng(): number;
	}

	export type LatLngLiteral = {
		lat: number;
		lng: number;
	};

	export type MapOptions = {
		center?: LatLng | LatLngLiteral;
		zoom?: number;
		mapTypeControl?: boolean;
		streetViewControl?: boolean;
		fullscreenControl?: boolean;
		mapId?: string;
	};

	export type MarkerOptions = {
		position?: LatLng | LatLngLiteral;
		map?: Map;
		draggable?: boolean;
		title?: string;
	};

	export type MapMouseEvent = {
		latLng: LatLng | null;
	};

	export namespace marker {
		export class AdvancedMarkerElement {
			constructor(options?: AdvancedMarkerElementOptions);
			position: LatLng | LatLngLiteral | null;
			map: Map | null;
			addListener(eventName: string, handler: Function): void;
		}

		export type AdvancedMarkerElementOptions = {
			map?: Map;
			position?: LatLng | LatLngLiteral;
			title?: string;
		};
	}

	export namespace places {
		export class Geocoder {
			geocode(
				request: GeocoderRequest,
				callback?: (results: GeocoderResult[], status: GeocoderStatus) => void
			): Promise<GeocoderResponse>;
		}

		export type GeocoderRequest = {
			address?: string;
			location?: LatLng | LatLngLiteral;
			placeId?: string;
			region?: string;
		};

		export type GeocoderResponse = {
			results: GeocoderResult[];
		};

		export type GeocoderResult = {
			geometry: {
				location: LatLng;
			};
			formatted_address: string;
			place_id: string;
		};

		export enum GeocoderStatus {
			OK = 'OK',
			ZERO_RESULTS = 'ZERO_RESULTS',
			OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
			REQUEST_DENIED = 'REQUEST_DENIED',
			INVALID_REQUEST = 'INVALID_REQUEST',
			UNKNOWN_ERROR = 'UNKNOWN_ERROR'
		}
	}
}

export {};
