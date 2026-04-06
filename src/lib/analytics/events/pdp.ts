import { trackClick } from './common';

export function trackToggleDesplegable(action: 'abrir' | 'cerrar', seccion: string): void {
	trackClick('pdp_click', `${action} desplegable`, seccion);
}

export function trackVerMas(seccion: string): void {
	trackClick('pdp_click', 'ver mas', seccion);
}
