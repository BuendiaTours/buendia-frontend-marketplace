import type { BreadcrumbItem } from '$lib/types/google-maps';

// Mapeo de rutas a labels legibles
const routeLabels: Record<string, string> = {
	'': 'Inicio',
	'activities': 'Actividades',
	'attractions': 'Atracciones',
	'destinations': 'Destinos',
	'distributives': 'Distributivos',
	'edit': 'Editar',
	'create': 'Crear',
	'new': 'Nuevo'
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
	const breadcrumbs: BreadcrumbItem[] = [{ label: 'Inicio', href: '/' }];

	let currentPath = '';
	segments.forEach((segment, index) => {
		currentPath += `/${segment}`;

		// Si es el último segmento, no incluir href (es la página actual)
		const isLast = index === segments.length - 1;

		// Si el segmento parece un slug (contiene guiones), no agregarlo
		// a menos que sea el último
		if (segment.includes('-') && !isLast) {
			return;
		}

		// Si es un slug y es el último, lo dejamos para que se sobrescriba
		// con el título real desde el servidor
		if (segment.includes('-') && isLast) {
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
 */
export function buildBreadcrumbs(
	pathname: string,
	finalItem?: { label: string; href?: string }
): BreadcrumbItem[] {
	const auto = generateBreadcrumbs(pathname);

	if (finalItem) {
		return [...auto, finalItem];
	}

	return auto;
}
