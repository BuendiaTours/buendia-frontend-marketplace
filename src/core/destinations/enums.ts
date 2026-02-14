/**
 * Enums del dominio de destinos
 */

export const DESTINATION_KIND_OPTIONS = [
	{ id: 'CITY', name: 'Ciudad' },
	{ id: 'REGION', name: 'Región' },
	{ id: 'COUNTRY', name: 'País' }
] as const;

export type DestinationKind = (typeof DESTINATION_KIND_OPTIONS)[number]['id'];
export const DESTINATION_KIND_VALUES = DESTINATION_KIND_OPTIONS.map((opt) => opt.id) as [
	string,
	...string[]
];
