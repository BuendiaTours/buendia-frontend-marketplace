/**
 * Copia una lista blanca de parámetros desde una URL de origen
 * a otra URL de destino.
 *
 * Útil para reenviar filtros desde la URL del navegador
 * hacia una llamada a una API.
 */
export function forwardSearchParams(
	source: URLSearchParams,
	target: URLSearchParams,
	allowedKeys: readonly string[]
) {
	for (const key of allowedKeys) {
		const value = source.get(key);
		if (value !== null && value !== '') {
			target.set(key, value);
		}
	}
}
