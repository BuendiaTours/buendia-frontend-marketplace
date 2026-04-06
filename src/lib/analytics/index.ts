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
export {
	trackOpinionesTopScroll,
	trackSaberMasPlan,
	trackOpinionesDestacadasScroll,
	trackVerTodoItinerario,
	trackVerMapa,
	trackToggleDesplegable,
	trackVerMas,
	trackMostrarMasOpiniones,
	trackOrdenOpiniones
} from './events/pdp';
export { trackOpenChat, trackCallChat, trackCtaExit } from './events/chat';
export { trackClick } from './events/common';
