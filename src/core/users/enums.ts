/**
 * Enums de dominio de usuarios
 * Espejo del backend — sin dependencias de UI ni traducciones
 */

export enum UserKind {
	CLIENT = 'CLIENT',
	ADMIN = 'ADMIN'
}

export enum UserRole {
	SUPPLY = 'SUPPLY',
	CUSTOMER_ATTENDANT = 'CUSTOMER_ATTENDANT',
	FINANCES = 'FINANCES',
	CONTENT = 'CONTENT'
}

export enum UserStatus {
	ACTIVE = 'ACTIVE',
	INACTIVE = 'INACTIVE',
	SUSPENDED = 'SUSPENDED'
}

export enum UserSortAttribute {
	NAME = 'NAME'
}
