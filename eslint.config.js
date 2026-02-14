/**
 * ESLint - Configuración
 *
 * Estructura:
 * 1. Ignores (generados, builds, deps)
 * 2. Reglas base (JS, TS, Svelte)
 * 3. Overrides por tipo de archivo
 *
 * npm run lint   → Prettier + ESLint
 * npx eslint . --fix → Auto-fix
 */

import prettier from 'eslint-config-prettier';
import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default defineConfig([
	// Respetar .gitignore
	includeIgnoreFile(gitignorePath),

	// Ignorar explícitamente archivos generados y output
	{
		ignores: [
			'.svelte-kit/**',
			'build/**',
			'storybook-static*/**',
			'src/paraglide/**',
			'*.config.js',
			'*.config.ts'
		]
	},

	// Base: JS + TS + Svelte + Prettier
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,

	// Reglas globales
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node },
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module'
			}
		},
		rules: {
			// TypeScript maneja undef
			'no-undef': 'off',

			// Navegación: usamos ROUTES centralizados + buildUrlWithFilters
			'svelte/no-navigation-without-resolve': 'off',

			// Errores — deben corregirse
			'no-console': ['warn', { allow: ['warn', 'error'] }],
			'no-unused-vars': 'off', // Usamos @typescript-eslint/no-unused-vars
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true
				}
			]
		}
	},

	// Svelte: parser y opciones específicas
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	},

	// Stories: reglas más permisivas (son ejemplos/demos)
	{
		files: ['**/*.stories.svelte', '**/*.stories.ts'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'svelte/require-each-key': 'off',
			'svelte/prefer-writable-derived': 'off',
			'no-useless-escape': 'off'
		}
	},

	// Tipos .d.ts: libs externas usan Function
	{
		files: ['**/*.d.ts'],
		rules: {
			'@typescript-eslint/no-unsafe-function-type': 'off'
		}
	}
]);
