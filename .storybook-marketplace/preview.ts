import type { Preview } from '@storybook/sveltekit';

/**
 * STORYBOOK MARKETPLACE - Preview Configuration
 *
 * Solo importa Tailwind CSS base (sin DaisyUI).
 * Los componentes marketplace son completamente custom.
 */

// Tailwind CSS base (sin DaisyUI, sin backoffice custom)
import '../src/routes/layout.css';

// CSS marketplace (si tienes custom styles)
import '../src/routes/(marketplace)/layout-marketplace.css';

// PhotoSwipe (si lo usas en componentes)
import 'photoswipe/style.css';

const preview: Preview = {
	decorators: [
		(story) => {
			// Añadir clase al HTML element
			if (typeof document !== 'undefined') {
				document.documentElement.classList.add('storybook');
			}
			return story();
		}
	],

	parameters: {
		// Controls
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		},

		// Backgrounds
		backgrounds: {
			default: 'light',
			values: [
				{ name: 'Light', value: '#ffffff' },
				{ name: 'Gray', value: '#f8f9fa' }
			]
		},

		// Viewport (responsive testing)
		viewport: {
			viewports: {
				mobile: {
					name: 'Mobile',
					styles: { width: '375px', height: '667px' }
				},
				tablet: {
					name: 'Tablet',
					styles: { width: '768px', height: '1024px' }
				},
				desktop: {
					name: 'Desktop',
					styles: { width: '1280px', height: '800px' }
				}
			}
		},

		// Accessibility testing
		a11y: {
			test: 'todo' // Show warnings pero no fail CI
		},

		// Layout
		layout: 'padded' // 'centered' | 'padded' | 'fullscreen'
	}
};

export default preview;
