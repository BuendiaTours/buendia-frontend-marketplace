/**
 * Enums del dominio de atracciones
 */

export const ATTRACTION_STATUS_OPTIONS = [
	{ id: 'ACTIVE', name: 'Activo' },
	{ id: 'DRAFT', name: 'Borrador' },
	{ id: 'INACTIVE', name: 'Inactivo' }
] as const;

export type AttractionStatus = (typeof ATTRACTION_STATUS_OPTIONS)[number]['id'];
export const ATTRACTION_STATUS_VALUES = ATTRACTION_STATUS_OPTIONS.map((opt) => opt.id) as [
	string,
	...string[]
];
