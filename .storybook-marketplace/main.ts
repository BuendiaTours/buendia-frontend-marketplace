import type { StorybookConfig } from '@storybook/sveltekit';

const config: StorybookConfig = {
	/**
	 * Stories - Solo componentes del MARKETPLACE
	 * No incluye componentes del backoffice
	 */
	stories: [
		'../src/stories/marketplace/**/*.mdx',
		'../src/stories/marketplace/**/*.stories.@(js|ts|svelte)',
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
	},

	async viteFinal(config) {
		return {
			...config,
			server: {
				...config.server,
				// 1. Permitimos explícitamente el host de Cloudflare
				allowedHosts: ['.trycloudflare.com', '.loca.lt', 'localhost'],
				// 2. Desactivamos el chequeo estricto de origen para los WebSockets (HMR)
				// hmr: {
				//   clientPort: 443,
				//   host: 'icon-girlfriend-release-bedrooms.trycloudflare.com', // Pon aquí el host actual del túnel
				// },
				// 3. Importante: permitimos que responda a cualquier IP interna
				host: true,
				strictPort: false
			}
		};
	}
};

export default config;
