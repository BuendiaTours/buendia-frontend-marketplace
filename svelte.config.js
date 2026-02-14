import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { preprocessMeltUI, sequence } from '@melt-ui/pp';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: sequence([vitePreprocess(), preprocessMeltUI()]),

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),
		alias: {
			$paraglide: './src/paraglide',
			'$api-shared': './src/lib/api/_shared',
			'$api-users': './src/lib/api/users',
			'$api-activities': './src/lib/api/activities',
			'$api-attractions': './src/lib/api/attractions',
			'$api-destinations': './src/lib/api/destinations',
			'$api-categories': './src/lib/api/categories',
			'$api-tags': './src/lib/api/tags',
			'$api-distributives': './src/lib/api/distributives'
		},
		experimental: {
			remoteFunctions: true
		}
	},
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};

export default config;
