import type { StorybookConfig } from '@storybook/sveltekit';

const config: StorybookConfig = {
	/**
	 * Stories - Solo componentes del MARKETPLACE
	 * No incluye componentes del backoffice
	 */
	stories: [
		'../src/lib/components/marketplace/**/*.mdx',
		'../src/lib/components/marketplace/**/*.stories.@(js|ts|svelte)',
		'../src/lib/layout/marketplace/**/*.stories.@(js|ts|svelte)'
	],

	addons: [
		'@storybook/addon-svelte-csf', // Escribir stories en .svelte
		'@chromatic-com/storybook', // Visual testing
		'@storybook/addon-vitest', // Component testing
		'@storybook/addon-a11y', // Accesibilidad
		'@storybook/addon-docs' // Documentación automática
	],

	framework: {
		name: '@storybook/sveltekit',
		options: {}
	},

	core: {
		disableTelemetry: true
	}
};

export default config;
