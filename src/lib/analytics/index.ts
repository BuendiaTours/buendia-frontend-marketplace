export type { EventName, GtmClickData, GtmEvent } from './types';
export { EVENT_NAMES } from './constants';
export type { GalleryLocation } from './constants';
export { pushEvent } from './gtm';
export {
	trackOpenGallery,
	trackNavigateGallery,
	trackCompleteGallery,
	trackChangeGallery
} from './events/gallery';
export { trackToggleDesplegable, trackVerMas } from './events/pdp';
export { trackOpenChat, trackCallChat, trackCtaExit } from './events/chat';
export { trackClick } from './events/common';
