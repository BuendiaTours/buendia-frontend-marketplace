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

	export interface LatLngLiteral {
		lat: number;
		lng: number;
	}

	export interface MapOptions {
		center?: LatLng | LatLngLiteral;
		zoom?: number;
		mapTypeControl?: boolean;
		streetViewControl?: boolean;
		fullscreenControl?: boolean;
		mapId?: string;
	}

	export interface MarkerOptions {
		position?: LatLng | LatLngLiteral;
		map?: Map;
		draggable?: boolean;
		title?: string;
	}

	export interface MapMouseEvent {
		latLng: LatLng | null;
	}

	export namespace marker {
		export class AdvancedMarkerElement {
			constructor(options?: AdvancedMarkerElementOptions);
			position: LatLng | LatLngLiteral | null;
			map: Map | null;
			addListener(eventName: string, handler: Function): void;
		}

		export interface AdvancedMarkerElementOptions {
			map?: Map;
			position?: LatLng | LatLngLiteral;
			title?: string;
		}
	}

	export namespace places {
		export class Geocoder {
			geocode(
				request: GeocoderRequest,
				callback?: (results: GeocoderResult[], status: GeocoderStatus) => void
			): Promise<GeocoderResponse>;
		}

		export interface GeocoderRequest {
			address?: string;
			location?: LatLng | LatLngLiteral;
			placeId?: string;
			region?: string;
		}

		export interface GeocoderResponse {
			results: GeocoderResult[];
		}

		export interface GeocoderResult {
			geometry: {
				location: LatLng;
			};
			formatted_address: string;
			place_id: string;
		}

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

export interface BreadcrumbItem {
	label: string;
	href?: string;
}

export type BreadcrumbConfig = BreadcrumbItem[];

export {};
