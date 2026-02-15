/**
 * Enums del dominio de categorías
 * Espejo del backend — sin dependencias de UI ni traducciones
 */

export enum CategoryKind {
	GLOBAL = 'GLOBAL',
	LOCAL = 'LOCAL'
}

export enum CategoryStatus {
	ACTIVE = 'ACTIVE',
	DRAFT = 'DRAFT',
	INACTIVE = 'INACTIVE'
}

export enum CategorySortAttribute {
	NAME = 'NAME'
}
