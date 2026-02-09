/**
 * PhotoSwipe Gallery - Marketplace Version
 *
 * Acción de Svelte para inicializar una galería PhotoSwipe en el marketplace.
 * https://photoswipe.com/getting-started/
 *
 * DIFERENCIAS con la versión backoffice:
 * - Configuración específica para marketplace (bgOpacity, animaciones, etc.)
 * - Estilos CSS diferentes (ver layout-marketplace.css)
 * - Sin dependencias de componentes backoffice
 *
 * @example
 * ```svelte
 * <script>
 *   import { photoswipeGallery } from '$lib/actions/marketplace/photoswipeGallery';
 * </script>
 *
 * <div use:photoswipeGallery>
 *   <a href="large-image-1.jpg" data-pswp-width="1200" data-pswp-height="800">
 *     <img src="thumb-1.jpg" alt="Image 1" />
 *   </a>
 *   <a href="large-image-2.jpg" data-pswp-width="1200" data-pswp-height="800">
 *     <img src="thumb-2.jpg" alt="Image 2" />
 *   </a>
 * </div>
 * ```
 */

import { browser } from '$app/environment';
import type PhotoSwipeLightbox from 'photoswipe/lightbox';

export interface PhotoswipeGalleryOptions {
	/** Selector CSS de los elementos clickeables (default: 'a') */
	children?: string;

	/** Tipo de animación al abrir/cerrar (default: 'zoom') */
	showHideAnimationType?: 'fade' | 'zoom' | 'none';

	/** Opacidad del fondo (default: 0.9 para marketplace) */
	bgOpacity?: number;

	/** Permitir zoom con rueda del mouse (default: true) */
	wheelToZoom?: boolean;

	/** Opciones adicionales de PhotoSwipe */
	[key: string]: unknown;
}

/**
 * Configuración por defecto para PhotoSwipe en marketplace
 * Más minimalista y enfocado en la experiencia del usuario final
 */
const marketplaceDefaults: Partial<PhotoswipeGalleryOptions> = {
	showHideAnimationType: 'zoom',
	bgOpacity: 0.95, // Fondo más oscuro para mejor contraste
	wheelToZoom: true,
	// Marketplace: priorizar UX sobre funcionalidades avanzadas
	closeOnVerticalDrag: true,
	pinchToClose: true,
	padding: { top: 20, bottom: 20, left: 20, right: 20 }
};

/**
 * Action de Svelte para inicializar PhotoSwipe Gallery
 */
export function photoswipeGallery(node: HTMLElement, options?: PhotoswipeGalleryOptions) {
	if (!browser) {
		return {
			destroy() {}
		};
	}

	let lightbox: PhotoSwipeLightbox | null = null;

	async function init() {
		// Lazy load de PhotoSwipe
		const { default: PhotoSwipeLightbox } = await import('photoswipe/lightbox');

		// Generar ID único si no existe
		if (!node.id) {
			node.id = `pswp-gallery-${Math.random().toString(36).substr(2, 9)}`;
		}

		// Inicializar lightbox con configuración marketplace
		lightbox = new PhotoSwipeLightbox({
			gallery: `#${node.id}`,
			pswpModule: () => import('photoswipe'),
			...marketplaceDefaults,
			children: 'a',
			...options
		});

		// Desactivar placeholder (mejora rendimiento)
		lightbox.addFilter('placeholderSrc', () => false);

		lightbox.init();
	}

	init();

	return {
		update(newOptions?: PhotoswipeGalleryOptions) {
			// Si cambian opciones, reinicializar
			if (lightbox) {
				lightbox.destroy();
				lightbox = null;
			}
			options = newOptions;
			init();
		},
		destroy() {
			if (lightbox) {
				lightbox.destroy();
				lightbox = null;
			}
		}
	};
}
