export const es = {
	common: {
		cancel: 'Cancelar',
		confirm: 'Confirmar',
		save: 'Guardar',
		delete: 'Eliminar',
		edit: 'Editar',
		close: 'Cerrar',
		search: 'Buscar',
		filter: 'Filtrar',
		clear: 'Limpiar',
		apply: 'Aplicar',
		loading: 'Cargando...',
		noResults: 'No hay resultados',
		error: 'Error',
		success: 'Éxito'
	},
	activities: {
		title: 'Actividades',
		newActivity: 'Nueva actividad',
		editActivity: 'Editar actividad',
		deleteActivity: 'Eliminar actividad',
		deleteConfirm: '¿Seguro que quieres eliminar este elemento?',
		noActivities: 'No hay actividades disponibles.',
		filters: {
			location: 'Filter by locations',
			clearLocation: 'Limpia la localización',
			freeTours: 'Free tours',
			dateRange: 'Rango de fechas',
			clearDateRange: 'Limpiar selección',
			advancedFilters: 'Filtros avanzados',
			clearFilters: 'Limpiar filtros',
			today: 'Hoy',
			thisWeek: 'Esta semana',
			next15Days: '15 días'
		},
		table: {
			id: 'Id',
			title: 'Título',
			location: 'Ubicación',
			rating: 'Valoración',
			isFreeTour: 'Free Tour',
			actions: 'Acciones'
		},
		pagination: {
			page: 'Página',
			of: 'de',
			showing: 'mostrando los elementos del',
			to: 'al'
		}
	}
} as const;

export type Translations = typeof es;
