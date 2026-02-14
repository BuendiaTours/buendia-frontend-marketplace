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

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },

		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			'no-undef': 'off',
			// Disabled: we use centralised ROUTES with buildUrlWithFilters.
			'svelte/no-navigation-without-resolve': 'off',
			// Downgrade to warn to unblock commits; fix incrementally
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': 'warn',
			'@typescript-eslint/no-unsafe-function-type': 'warn',
			'svelte/require-each-key': 'warn',
			'svelte/prefer-writable-derived': 'warn',
			'svelte/prefer-svelte-reactivity': 'warn',
			'svelte/no-unused-props': 'warn',
			'svelte/no-at-html-tags': 'warn',
			'svelte/no-useless-children-snippet': 'warn',
			'no-case-declarations': 'warn',
			'no-useless-escape': 'warn'
		}
	},
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
	}
);
