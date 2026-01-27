// Tipos básicos para Google Maps API
declare global {
	interface Window {
		google: typeof google;
	}
}

declare namespace google.maps {
	class Map {
		constructor(mapDiv: HTMLElement, opts?: MapOptions);
		setCenter(latlng: LatLng | LatLngLiteral): void;
		addListener(eventName: string, handler: Function): void;
	}

	class Marker {
		constructor(opts?: MarkerOptions);
		setPosition(latlng: LatLng | LatLngLiteral): void;
		getPosition(): LatLng | null;
		addListener(eventName: string, handler: Function): void;
	}

	class LatLng {
		constructor(lat: number, lng: number);
		lat(): number;
		lng(): number;
	}

	interface LatLngLiteral {
		lat: number;
		lng: number;
	}

	interface MapOptions {
		center?: LatLng | LatLngLiteral;
		zoom?: number;
		mapTypeControl?: boolean;
		streetViewControl?: boolean;
		fullscreenControl?: boolean;
	}

	interface MarkerOptions {
		position?: LatLng | LatLngLiteral;
		map?: Map;
		draggable?: boolean;
		title?: string;
	}

	interface MapMouseEvent {
		latLng: LatLng | null;
	}
}

export {};
