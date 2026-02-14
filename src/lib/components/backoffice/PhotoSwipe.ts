// https://photoswipe.com/getting-started/
import { browser } from '$app/environment';
import { photoSwipeDefaults } from '$lib/config/components';

type PhotoSwipeItem =
	| {
			src: string;
			width: number;
			height: number;
			alt?: string;
	  }
	| {
			html: string;
	  };

export type PhotoSwipeOptions = {
	bgOpacity?: number;
	wheelToZoom?: boolean;
	showHideAnimationType?: 'fade' | 'zoom' | 'none';
	[key: string]: unknown;
};

export async function openLightbox(
	items: PhotoSwipeItem[],
	index = 0,
	options?: PhotoSwipeOptions
) {
	if (!browser) return;

	const { default: PhotoSwipe } = await import('photoswipe');

	const pswp = new PhotoSwipe({
		dataSource: items,
		index,
		// Merge: defaults < options pasadas
		...photoSwipeDefaults,
		...options
	});

	pswp.init();
}
