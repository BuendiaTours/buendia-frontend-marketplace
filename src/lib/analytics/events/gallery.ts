import { trackClick } from './common';
import type { GalleryLocation } from '../constants';

export function trackOpenGallery(location: GalleryLocation): void {
	trackClick('pdp_click', 'open gallery', location);
}

export function trackNavigateGallery(location: GalleryLocation): void {
	trackClick('pdp_click', 'navigate gallery', location);
}

export function trackCompleteGallery(location: GalleryLocation): void {
	trackClick('pdp_click', 'complete gallery', location);
}

export function trackChangeGallery(from: GalleryLocation, to: GalleryLocation): void {
	trackClick('pdp_click', 'change gallery', from, to);
}
