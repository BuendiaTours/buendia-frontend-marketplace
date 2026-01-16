/**
 * Formatea una fecha en formato ISO 8601 (YYYY-MM-DD).
 * Usa UTC para evitar problemas de zona horaria.
 *
 * @example
 * formatDateYYYYMMDD(new Date('2025-01-15T10:30:00Z')) // '2025-01-15'
 */
export function formatDateYYYYMMDD(d: Date): string {
	// Usamos UTC para evitar problemas de zona horaria al serializar fechas
	const year = d.getUTCFullYear();
	const month = String(d.getUTCMonth() + 1).padStart(2, '0');
	const day = String(d.getUTCDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}
