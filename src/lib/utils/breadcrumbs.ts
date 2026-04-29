import type { BreadcrumbItem } from '$lib/types';

/**
 * Genera breadcrumbs para la página de detalle de un destino.
 * Ejemplo: Inicio › Barcelona
 */
export function buildDestinationBreadcrumbs(destination: { name: string }): BreadcrumbItem[] {
	return [{ label: 'Inicio', href: '/' }, { label: destination.name }];
}

/**
 * Genera breadcrumbs para la página de detalle de una actividad.
 * Ejemplo: Inicio › Barcelona › Tour por el Barrio Gótico
 *
 * Nota: la API no devuelve el slug del destino en la actividad, por lo que
 * el destino intermedio no tiene href. Para enlazarlo habría que hacer un fetch
 * adicional del destino en el server load.
 */
export function buildActivityBreadcrumbs(activity: {
	title: string;
	destinations: Array<{ id: string; name: string; href: string }>;
}): BreadcrumbItem[] {
	const destination = activity.destinations[0];
	const items: BreadcrumbItem[] = [{ label: 'Inicio', href: '/' }];
	if (destination) {
		items.push({ label: destination.name, href: destination.href });
	}
	items.push({ label: activity.title });
	return items;
}
