/**
 * Re-export de enums por compatibilidad.
 * Los enums viven en cada módulo API:
 * - $api-activities/enums
 * - $api-attractions/enums
 * - $api-destinations/enums
 *
 * Importar desde el módulo correspondiente en código nuevo.
 */

export * from '$api-activities/enums';
export * from '$api-attractions/enums';
export * from '$api-destinations/enums';
