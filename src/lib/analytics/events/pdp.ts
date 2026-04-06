import { trackClick } from './common';

export function trackOpinionesTopScroll(): void {
	trackClick('pdp_click', 'opiniones top scroll', 'opiniones');
}

export function trackSaberMasPlan(): void {
	trackClick('pdp_click', 'saber mas', 'plan bybuendia');
}

export function trackOpinionesDestacadasScroll(): void {
	trackClick('pdp_click', 'opiniones destacadas scroll', 'opiniones');
}

export function trackVerTodoItinerario(): void {
	trackClick('pdp_click', 'ver todo el itinerario', 'itinerario');
}

export function trackVerMapa(): void {
	trackClick('pdp_click', 'ver mapa', 'itinerario');
}

export function trackToggleDesplegable(action: 'abrir' | 'cerrar', seccion: string): void {
	trackClick('pdp_click', `${action} desplegable`, seccion);
}

export function trackVerMas(seccion: string): void {
	trackClick('pdp_click', 'ver mas', seccion);
}

export function trackMostrarMasOpiniones(): void {
	trackClick('pdp_click', 'mostrar mas', 'opiniones');
}

export function trackOrdenOpiniones(tipoOrden: string): void {
	trackClick('pdp_click', tipoOrden, 'opiniones');
}
