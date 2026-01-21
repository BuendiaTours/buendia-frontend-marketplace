/**
 * Copia un texto al portapapeles del usuario
 *
 * @param text - El texto a copiar
 * @returns Promise<boolean> - true si se copió correctamente, false si hubo un error
 *
 * @example
 * ```typescript
 * // Uso básico
 * const success = await copyToClipboard('Texto a copiar');
 * if (success) {
 *   console.log('Copiado al portapapeles');
 * }
 *
 * // En un componente Svelte con feedback visual
 * let copied = $state(false);
 *
 * async function handleCopy() {
 *   const success = await copyToClipboard($form.title);
 *   if (success) {
 *     copied = true;
 *     setTimeout(() => copied = false, 2000);
 *   }
 * }
 * ```
 */
export async function copyToClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch (err) {
		console.error('Error al copiar al portapapeles:', err);
		return false;
	}
}
