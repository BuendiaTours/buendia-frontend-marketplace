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
 * MODOS DE USO:
 *
 * 1. Modo DOM (default): PhotoSwipe lee los <a> del nodo y prearga dimensiones automáticamente.
 * ```svelte
 * <div use:photoswipeGallery>
 *   <a href="large-1.jpg"><img src="thumb-1.jpg" /></a>
 *   <a href="large-2.jpg"><img src="thumb-2.jpg" /></a>
 * </div>
 * ```
 *
 * 2. Modo dataSource: útil cuando el HTML solo muestra N imágenes pero el lightbox debe
 *    mostrar M > N. Se pasa el array completo y se usa data-gallery-index en los <a>.
 * ```svelte
 * <div use:photoswipeGallery={{ dataSource: allItems }}>
 *   <a href="large-1.jpg" data-gallery-index="0"><img src="thumb-1.jpg" /></a>
 *   <a href="large-2.jpg" data-gallery-index="1"><img src="thumb-2.jpg" /></a>
 * </div>
 * ```
 */

import { browser } from '$app/environment';
import type PhotoSwipeLightbox from 'photoswipe/lightbox';

export type DataSourceItem = {
	src: string;
	width: number;
	height: number;
	alt?: string;
};

export type PhotoswipeGalleryOptions = {
	/** Selector CSS de los elementos clickeables (default: 'a') */
	children?: string;

	/** Tipo de animación al abrir/cerrar (default: 'zoom') */
	showHideAnimationType?: 'fade' | 'zoom' | 'none';

	/** Opacidad del fondo (default: 0.9 para marketplace) */
	bgOpacity?: number;

	/** Permitir zoom con rueda del mouse (default: true) */
	wheelToZoom?: boolean;

	/**
	 * Array completo de items para el lightbox. Cuando se provee, PhotoSwipe se abre
	 * programáticamente usando data-gallery-index en los <a> para el índice inicial.
	 */
	dataSource?: DataSourceItem[];

	/** Opciones adicionales de PhotoSwipe */
	[key: string]: unknown;
};

/**
 * Configuración por defecto para PhotoSwipe en marketplace
 * Más minimalista y enfocado en la experiencia del usuario final
 */
const marketplaceDefaults: Partial<PhotoswipeGalleryOptions> = {
	showHideAnimationType: 'zoom',
	bgOpacity: 0.95,
	wheelToZoom: false,
	closeOnVerticalDrag: false,
	pinchToClose: true,
	padding: { top: 40, bottom: 40, left: 40, right: 40 }
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

	// ── Modo DOM ──────────────────────────────────────────────────────────────
	// Preloads dimensions for a link and sets data-pswp-width/height on the element.
	function preloadLink(link: HTMLAnchorElement): Promise<void> {
		if (link.dataset.pswpWidth && link.dataset.pswpHeight) return Promise.resolve();

		return new Promise((resolve) => {
			const img = new Image();
			img.onload = () => {
				link.dataset.pswpWidth = String(img.naturalWidth);
				link.dataset.pswpHeight = String(img.naturalHeight);
				resolve();
			};
			img.onerror = () => resolve();
			img.src = link.href;
		});
	}

	// Click interception fallback for DOM mode: wait for preload if not done yet.
	function handleClick(e: MouseEvent) {
		const link = (e.target as Element).closest('a') as HTMLAnchorElement | null;
		if (!link || (link.dataset.pswpWidth && link.dataset.pswpHeight)) return;

		e.preventDefault();
		e.stopImmediatePropagation();
		preloadLink(link).then(() => link.click());
	}

	// ── Modo dataSource ───────────────────────────────────────────────────────
	// Opens PhotoSwipe programmatically at the index from data-gallery-index.
	function handleDataSourceClick(e: MouseEvent) {
		const link = (e.target as Element).closest('a') as HTMLAnchorElement | null;
		if (!link) return;

		e.preventDefault();
		e.stopImmediatePropagation();
		const index = parseInt(link.dataset.galleryIndex ?? '0', 10);
		lightbox?.loadAndOpen(index);
	}

	// ── Init ──────────────────────────────────────────────────────────────────
	const isDataSourceMode = !!options?.dataSource;

	if (isDataSourceMode) {
		node.addEventListener('click', handleDataSourceClick, true);
	} else {
		// Eagerly preload all gallery links so dimensions are ready before any click.
		node.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(preloadLink);
		node.addEventListener('click', handleClick, true);
	}

	async function init() {
		const { default: PhotoSwipeLightbox } = await import('photoswipe/lightbox');

		// Spread options without dataSource to avoid passing it to PhotoSwipe
		const { dataSource, ...pswpOptions } = options ?? {};

		if (isDataSourceMode && dataSource) {
			lightbox = new PhotoSwipeLightbox({
				dataSource: dataSource.map(({ src, width, height, alt }) => ({
					src,
					width,
					height,
					alt
				})),
				pswpModule: () => import('photoswipe'),
				...marketplaceDefaults,
				...pswpOptions
			});
		} else {
			if (!node.id) {
				node.id = `pswp-gallery-${Math.random().toString(36).slice(2, 11)}`;
			}
			lightbox = new PhotoSwipeLightbox({
				gallery: `#${node.id}`,
				pswpModule: () => import('photoswipe'),
				...marketplaceDefaults,
				children: 'a',
				...pswpOptions
			});
		}

		lightbox.addFilter('placeholderSrc', () => false);
		lightbox.init();
	}

	init();

	return {
		update(newOptions?: PhotoswipeGalleryOptions) {
			if (lightbox) {
				lightbox.destroy();
				lightbox = null;
			}
			options = newOptions;
			init();
		},
		destroy() {
			node.removeEventListener('click', handleDataSourceClick, true);
			node.removeEventListener('click', handleClick, true);
			if (lightbox) {
				lightbox.destroy();
				lightbox = null;
			}
		}
	};
}
