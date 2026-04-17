import type { BreadcrumbItem } from '$lib/types';
import { ROUTES } from '$lib/config/routes';

// Mapeo de rutas a labels legibles
const routeLabels: Record<string, string> = {
	'': 'Inicio',
	backoffice: 'Backoffice',
	activities: 'Actividades',
	attractions: 'Atracciones',
	categories: 'Categorias',
	locations: 'Ubicaciones',
	'pickup-points': 'Puntos de recogida',
	distributives: 'Distributivas',
	'free-tours': 'Free Tours',
	drafts: 'Borradores',
	suppliers: 'Proveedores',
	tags: 'Tags',
	faqs: 'FAQs',
	bookings: 'Reservas',
	multimedia: 'Multimedia',
	'content-blocks': 'Bloques de contenido',
	analytics: 'Analytics',
	users: 'Usuarios',
	edit: 'Editar',
	create: 'Crear',
	new: 'Nuevo'
};

/**
 * Genera breadcrumbs automáticamente desde la ruta actual
 * @param pathname - La ruta actual (ej: '/activities/tour-barcelona/edit')
 * @param customItems - Items personalizados para sobrescribir los auto-generados
 */
export function generateBreadcrumbs(
	pathname: string,
	customItems?: BreadcrumbItem[]
): BreadcrumbItem[] {
	// Si hay items personalizados, usarlos directamente
	if (customItems && customItems.length > 0) {
		return customItems;
	}

	// Auto-generar desde la ruta
	const segments = pathname.split('/').filter(Boolean);
	const breadcrumbs: BreadcrumbItem[] = [{ label: 'Inicio', href: ROUTES.backoffice.home }];

	let currentPath = '';
	segments.forEach((segment, index) => {
		currentPath += `/${segment}`;

		// Si es el último segmento, no incluir href (es la página actual)
		const isLast = index === segments.length - 1;

		// Si el segmento parece un slug (contiene guiones) y no es una ruta conocida,
		// no agregarlo — a menos que sea el último
		const isKnownRoute = segment in routeLabels;
		if (segment.includes('-') && !isKnownRoute && !isLast) {
			return;
		}

		if (segment.includes('-') && !isKnownRoute && isLast) {
			return; // Se agregará desde customItems
		}

		breadcrumbs.push({
			label: routeLabels[segment] || segment,
			href: isLast ? undefined : currentPath
		});
	});

	return breadcrumbs;
}

/**
 * Combina breadcrumbs auto-generados con un item final personalizado
 * Útil para páginas de detalle donde necesitas el título del recurso
 * Esta función filtra slugs y palabras como 'edit' para páginas de detalle
 */
export function buildBreadcrumbs(
	pathname: string,
	finalItem?: { label: string; href?: string }
): BreadcrumbItem[] {
	// Para páginas de detalle (ej: /attractions/alhambra/edit)
	// Solo queremos: Inicio > Atracciones > [Nombre del recurso]
	const segments = pathname.split('/').filter(Boolean);
	const breadcrumbs: BreadcrumbItem[] = [{ label: 'Inicio', href: ROUTES.backoffice.home }];

	// Añadir segmentos de sección usando ROUTES para URLs canónicas (evita /backoffice//users)
	const slugPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	const sectionRoutes: Record<string, string> = {
		backoffice: ROUTES.backoffice.home.replace(/\/$/, ''), // sin trailing slash
		users: ROUTES.backoffice.users.list,
		activities: ROUTES.backoffice.activities.list,
		attractions: ROUTES.backoffice.attractions.list,
		categories: ROUTES.backoffice.categories.list,
		locations: ROUTES.backoffice.locations.list,
		'pickup-points': ROUTES.backoffice.pickupPoints.list,
		suppliers: ROUTES.backoffice.suppliers.list,
		tags: ROUTES.backoffice.tags.list,
		faqs: ROUTES.backoffice.faqs.list,
		bookings: ROUTES.backoffice.bookings.list,
		multimedia: ROUTES.backoffice.multimedia.list,
		'content-blocks': ROUTES.backoffice.contentBlocks.list,
		distributives: ROUTES.backoffice.distributives.list,
		'free-tours': ROUTES.backoffice.freeTours.list,
		analytics: ROUTES.backoffice.analytics.dashboard,
		'api-catalog': ROUTES.backoffice.apiCatalog,
		components: ROUTES.backoffice.components
	};
	for (const segment of segments) {
		if (segment === 'edit' || segment === 'create') break;
		if (
			slugPattern.test(segment) ||
			(segment.includes('-') && segment.length > 10 && !(segment in sectionRoutes))
		)
			break;
		const href =
			sectionRoutes[segment] ?? `/${segments.slice(0, segments.indexOf(segment) + 1).join('/')}`;
		breadcrumbs.push({
			label: routeLabels[segment] || segment,
			href
		});
	}

	// Añadir el item final si existe (el título del recurso)
	if (finalItem) {
		breadcrumbs.push(finalItem);
	}

	return breadcrumbs;
}
