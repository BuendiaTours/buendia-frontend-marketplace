/**
 * Configuración de VARIANTS disponibles (un variant es la configuración de un crop)
 *
 * Define qué variants están disponibles en el editor.
 * Esta configuración puede venir de un JSON local, una API, o pasarse como prop.
 */

/**
 * Definición de un variants disponible
 *
 * El ID se genera cuando se crean los variants, no se define en la configuración
 */
export type VariantDefinition = {
	id: string; // ID único (vacío en config, se genera al crear variants)
	preset: string; // Preset que identifica el tipo (e.g., "HERO_DESKTOP", "LISTING")
	format: string; // Formato de imagen (e.g., "WEBP", "JPEG", "PNG")
	width: number; // Ancho final en píxeles
	height: number; // Alto final en píxeles
};

/**
 * Valida un aspect ratio en formato "W:H"
 */
export function parseAspectRatio(aspectRatio: string): number {
	const parts = aspectRatio.split(':');
	if (parts.length !== 2) {
		throw new Error(`Invalid aspect ratio format: ${aspectRatio}`);
	}
	const width = parseFloat(parts[0]);
	const height = parseFloat(parts[1]);
	if (isNaN(width) || isNaN(height) || height === 0) {
		throw new Error(`Invalid aspect ratio values: ${aspectRatio}`);
	}
	return width / height;
}

/**
 * Calcula el aspect ratio desde dimensiones
 */
export function calculateAspectRatio(width: number, height: number): number {
	return width / height;
}

/**
 * Formatea un aspect ratio como string (e.g., "16:9", "1:1")
 */
export function formatAspectRatio(width: number, height: number): string {
	const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
	const divisor = gcd(width, height);
	return `${width / divisor}:${height / divisor}`;
}
