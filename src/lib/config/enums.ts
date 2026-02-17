/**
 * Re-export de enums por compatibilidad.
 * Los enums viven en cada módulo API:
 * - $core/activities/enums
 * - $core/attractions/enums
 * - $core/destinations/enums
 *
 * Importar desde el módulo correspondiente en código nuevo.
 */

export * from '$core/activities/enums';
export * from '$core/attractions/enums';
export * from '$core/destinations/enums';
