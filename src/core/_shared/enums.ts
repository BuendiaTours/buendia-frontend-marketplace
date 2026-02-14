/**
 * Enums de criteria comunes
 * Espejo del backend — sin dependencias de UI ni traducciones
 */

export enum CriteriaFilterOperator {
	EQUALS = 'EQUALS',
	GREATER_THAN = 'GREATER_THAN',
	LOWER_THAN = 'LOWER_THAN',
	GREATER_THAN_OR_EQUALS = 'GREATER_THAN_OR_EQUALS',
	LOWER_THAN_OR_EQUALS = 'LOWER_THAN_OR_EQUALS'
}

export enum CriteriaOperator {
	AND = 'AND',
	OR = 'OR'
}

export enum CriteriaSortOption {
	ASC = 'ASC',
	DESC = 'DESC'
}
