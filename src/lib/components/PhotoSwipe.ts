// https://photoswipe.com/getting-started/
import { browser } from '$app/environment';

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

export async function openLightbox(items: PhotoSwipeItem[], index = 0) {
	if (!browser) return;

	const { default: PhotoSwipe } = await import('photoswipe');

	const pswp = new PhotoSwipe({
		dataSource: items,
		index,
		bgOpacity: 0.9,
		wheelToZoom: true
	});

	pswp.init();
}
