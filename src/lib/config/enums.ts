import * as m from '$paraglide/messages';

// Array de las claves
// STAGE_KINDS_OPTIONS.map((option) => option.id) as [string, ...string[]]

// Activities

export const ACTIVITY_NOT_SUITABLE_FOR_OPTIONS = [
	{ id: 'ADULTS', name: 'Adultos' },
	{ id: 'CHILDREN', name: 'Niños' },
	{ id: 'FAMILIES', name: 'Familias' },
	{ id: 'GROUPS', name: 'Grupos' },
	{ id: 'INDIVIDUALS', name: 'Individuos' }
];

export const ACTIVITY_STATUS_OPTIONS = [
	{ id: 'APPROVED', name: 'Aprobada' },
	{ id: 'DELETED', name: 'Eliminada' },
	{ id: 'DRAFT', name: 'Borraor' },
	{ id: 'PENDING_REVIEW', name: 'Pendiente de revisión' },
	{ id: 'PUBLISHED', name: 'Publicada' },
	{ id: 'REJECTED', name: 'Rechazada' },
	{ id: 'UNPUBLISHED', name: 'No publicada' }
];

// Stages

export const STAGE_REQUIREMENT_OPTIONS = [
	{ id: 'REQUIRED', name: 'Requerido' },
	{ id: 'OPTIONAL', name: 'Opcional' },
	{ id: 'CONDITIONAL', name: 'Condicional' }
];

export const STAGE_KIND_OPTIONS = [
	{
		id: 'TRANSFER',
		name: m.enums_stageKinds_transfer_name(),
		description: m.enums_stageKinds_transfer_description()
	},
	{
		id: 'EXPERIENCE',
		name: m.enums_stageKinds_experience_name(),
		description: m.enums_stageKinds_experience_description()
	}
];

export const STAGE_RELEVANCE_OPTIONS = [
	{ id: 'HIGH', name: 'Alta' },
	{ id: 'MEDIUM', name: 'Media' },
	{ id: 'LOW', name: 'Baja' },
	{ id: 'NONE', name: 'Ninguna' }
];

// Attractions

export const ATTRACTION_STATUS_OPTIONS = [
	{ id: 'ACTIVE', name: 'Activo' },
	{ id: 'DRAFT', name: 'Borrador' },
	{ id: 'INACTIVE', name: 'Inactivo' }
];

// Destinations

export const DESTINATION_KIND_OPTIONS = [
	{ id: 'CITY', name: 'Ciudad' },
	{ id: 'REGION', name: 'Región' },
	{ id: 'COUNTRY', name: 'País' }
];
