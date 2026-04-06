/**
 * @module auth/enums
 * @description Domain enums for the Auth resource.
 * These mirror the backend contract exactly and carry no UI or i18n dependencies.
 */

/** Authentication provider kind. */
export enum AuthProviderKind {
	COGNITO = 'COGNITO',
	GOOGLE = 'GOOGLE'
}
