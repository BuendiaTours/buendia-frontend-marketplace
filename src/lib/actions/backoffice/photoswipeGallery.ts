// src/lib/actions/photoswipeGallery.ts
/**
 * Acción de Svelte para inicializar una galería PhotoSwipe
 * https://photoswipe.com/getting-started/
 *
 * Uso:
 * import { photoswipeGallery } from '$lib/actions/photoswipeGallery';
 *
 * <div use:photoswipeGallery={{ children: 'a' }}>
 *   <a href="image1.jpg" data-pswp-width="800" data-pswp-height="600">
 *     <img src="thumb1.jpg" alt="Photo 1" />
 *   </a>
 *   <a href="image2.jpg" data-pswp-width="800" data-pswp-height="600">
 *     <img src="thumb2.jpg" alt="Photo 2" />
 *   </a>
 * </div>
 *
 * Características:
 * - Inicializa automáticamente PhotoSwipe en el elemento
 * - Carga lazy de PhotoSwipe (solo cuando se necesita)
 * - Limpieza automática al destruir el componente
 * - Configurable mediante opciones
 */

import { browser } from '$app/environment';
import type PhotoSwipeLightbox from 'photoswipe/lightbox';
import { photoSwipeDefaults } from '$lib/config/components';

export type PhotoswipeGalleryOptions = {
	children?: string;
	showHideAnimationType?: 'fade' | 'zoom' | 'none';
	bgOpacity?: number;
	wheelToZoom?: boolean;
	[key: string]: unknown;
};

export function photoswipeGallery(node: HTMLElement, options?: PhotoswipeGalleryOptions) {
	if (!browser) {
		return {
			destroy() {}
		};
	}

	let lightbox: PhotoSwipeLightbox | null = null;

	async function init() {
		const { default: PhotoSwipeLightbox } = await import('photoswipe/lightbox');

		// Generar un ID único si el nodo no tiene uno
		if (!node.id) {
			node.id = `pswp-gallery-${Math.random().toString(36).substr(2, 9)}`;
		}

		lightbox = new PhotoSwipeLightbox({
			gallery: `#${node.id}`,
			pswpModule: () => import('photoswipe'),
			// Merge: defaults globales < children default < options pasadas
			...photoSwipeDefaults,
			children: 'a',
			...options
		});

		// Desactiva el placeholder detrás de la imagen ampliada
		lightbox.addFilter('placeholderSrc', () => false);

		lightbox.init();
	}

	init();

	return {
		update(newOptions?: PhotoswipeGalleryOptions) {
			// Si cambian las opciones, reiniciar
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
