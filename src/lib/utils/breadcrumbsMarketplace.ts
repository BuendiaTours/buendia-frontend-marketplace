import type { BreadcrumbItem } from '$lib/types';

/**
 * Genera breadcrumbs para la página de detalle de una ubicación.
 * Ejemplo: Inicio › Barcelona
 */
export function buildLocationBreadcrumbs(location: { name: string }): BreadcrumbItem[] {
	return [{ label: 'Inicio', href: '/' }, { label: location.name }];
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
	locations?: Array<{ id: string; name: string; href?: string }>;
	destinations?: Array<{ id: string; name: string; href?: string }>;
}): BreadcrumbItem[] {
	const locs = activity.locations ?? activity.destinations ?? [];
	const loc = locs[0];
	const items: BreadcrumbItem[] = [{ label: 'Inicio', href: '/' }];
	if (loc) {
		items.push({ label: loc.name, href: loc.href });
	}
	items.push({ label: activity.title });
	return items;
}
