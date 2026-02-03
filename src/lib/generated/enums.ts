/**
 * Auto-generated enums from API
 * Generated: 2026-02-03T10:44:52.681Z
 * API Base: http://localhost:3333
 *
 * DO NOT EDIT MANUALLY
 * Run: npm run generate:enums
 */

// Activities

export const ACTIVITY_STATUS_OPTIONS = [
	{ id: 'APPROVED', name: 'Aprobada' },
	{ id: 'DELETED', name: 'Borrada' },
	{ id: 'DRAFT', name: 'Borrador' },
	{ id: 'PENDING_REVIEW', name: 'Pendiente de revisión' },
	{ id: 'PUBLISHED', name: 'Publicada' },
	{ id: 'REJECTED', name: 'Rechazada' },
	{ id: 'UNPUBLISHED', name: 'No publicada' }
] as const;

export type ActivityStatus = (typeof ACTIVITY_STATUS_OPTIONS)[number]['id'];
export const ACTIVITY_STATUS_VALUES = ACTIVITY_STATUS_OPTIONS.map((opt) => opt.id) as [
	string,
	...string[]
];

export const ACTIVITY_GUIDE_KIND_OPTIONS = [
	{ id: 'AUTO', name: 'Auto' },
	{ id: 'CUSTOM_LANGUAGE', name: 'Idioma personalizado' },
	{ id: 'DRIVER', name: 'Conductor' },
	{ id: 'GUEST', name: 'Invitado' },
	{ id: 'INSTRUCTOR', name: 'Instructor' }
];

export type ActivityGuideKind = (typeof ACTIVITY_GUIDE_KIND_OPTIONS)[number]['id'];
export const ACTIVITY_GUIDE_KIND_VALUES = ACTIVITY_GUIDE_KIND_OPTIONS.map((opt) => opt.id) as [
	string,
	...string[]
];

///////////////////////////////////////
// Stages
///////////////////////////////////////

export const STAGE_REQUIREMENT_OPTIONS = [
	{ id: 'REQUIRED', name: 'Obligatorio' },
	{ id: 'OPTIONAL', name: 'Opcional' },
	{ id: 'SUGGESTED', name: 'Recomendado' },
	{ id: 'NONE', name: 'Ninguno' }
] as const;

export type StageRequirement = (typeof STAGE_REQUIREMENT_OPTIONS)[number]['id'];
export const STAGE_REQUIREMENT_VALUES = STAGE_REQUIREMENT_OPTIONS.map((opt) => opt.id) as [
	string,
	...string[]
];

export const STAGE_KIND_OPTIONS = [
	{
		id: 'TRANSFER',
		name: 'Transfer',
		description: 'Movimiento entre puntos (bus, tren, coche, barco, etc.)'
	},
	{
		id: 'EXPERIENCE',
		name: 'Experience',
		description: 'Experiencia (visita, comida, show, concierto, etc.)'
	}
] as const;

export type StageKind = (typeof STAGE_KIND_OPTIONS)[number]['id'];
export const STAGE_KIND_VALUES = STAGE_KIND_OPTIONS.map((opt) => opt.id) as [string, ...string[]];

export const STAGE_RELEVANCE_OPTIONS = [
	{ id: 'HIGH', name: 'Alta' },
	{ id: 'MEDIUM', name: 'Media' },
	{ id: 'LOW', name: 'Baja' },
	{ id: 'NONE', name: 'Ninguna' }
] as const;

export type StageRelevance = (typeof STAGE_RELEVANCE_OPTIONS)[number]['id'];
export const STAGE_RELEVANCE_VALUES = STAGE_RELEVANCE_OPTIONS.map((opt) => opt.id) as [
	string,
	...string[]
];
