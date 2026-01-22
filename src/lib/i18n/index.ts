import { writable, derived } from 'svelte/store';
import { es, type Translations } from './es';

// Idiomas disponibles
const translations = {
	es
} as const;

type Locale = keyof typeof translations;

// Store para el idioma actual
export const locale = writable<Locale>('es');

// Store derivado con las traducciones del idioma actual
export const t = derived(locale, ($locale) => {
	return translations[$locale];
});

// Helper para cambiar el idioma
export function setLocale(newLocale: Locale) {
	locale.set(newLocale);
}

// Helper para obtener una traducción por path (ej: 'activities.newActivity')
export function getTranslation(path: string, translations: Translations): string {
	const keys = path.split('.');
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let result: any = translations;

	for (const key of keys) {
		if (result && typeof result === 'object' && key in result) {
			result = result[key];
		} else {
			console.warn(`Translation key not found: ${path}`);
			return path;
		}
	}

	return typeof result === 'string' ? result : path;
}

// Type helper para autocompletado de paths
export type TranslationPath =
	| `common.${keyof typeof es.common}`
	| `activities.${keyof typeof es.activities}`
	| `activities.filters.${keyof typeof es.activities.filters}`
	| `activities.table.${keyof typeof es.activities.table}`
	| `activities.pagination.${keyof typeof es.activities.pagination}`;
