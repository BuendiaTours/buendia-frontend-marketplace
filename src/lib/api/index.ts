/**
 * API - Default Export
 *
 * Por compatibilidad, este archivo re-exporta todo desde api/backoffice
 * para que los imports existentes sigan funcionando.
 *
 * NOTA: Eventualmente, cuando dividas en 2 repos, eliminarás este archivo
 * y cada proyecto tendrá su propio entry point:
 * - Backoffice: import from '$lib/api/backoffice'
 * - Marketplace: import from '$lib/api/marketplace'
 */

export * from './backoffice/index';
