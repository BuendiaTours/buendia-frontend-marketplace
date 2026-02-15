/**
 * @module _shared/enums
 * @description Shared criteria enums mirroring the backend contract.
 * These are used across every resource module to express filtering,
 * logical combination, and sorting semantics in API queries.
 * No UI or i18n dependencies.
 */

/** Comparison operators for individual filter fields. */
export enum CriteriaFilterOperator {
	EQUALS = 'EQUALS',
	GREATER_THAN = 'GREATER_THAN',
	LOWER_THAN = 'LOWER_THAN',
	GREATER_THAN_OR_EQUALS = 'GREATER_THAN_OR_EQUALS',
	LOWER_THAN_OR_EQUALS = 'LOWER_THAN_OR_EQUALS'
}

/** Logical operators for combining multiple filter clauses. */
export enum CriteriaOperator {
	AND = 'AND',
	OR = 'OR'
}

/** Sort direction options. */
export enum CriteriaSortOption {
	ASC = 'ASC',
	DESC = 'DESC'
}
