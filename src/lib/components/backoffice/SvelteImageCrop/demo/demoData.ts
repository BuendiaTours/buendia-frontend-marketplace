/**
 * Pre-configured demo images for examples and testing
 *
 * These are Unsplash product images with standard dimensions (2400x1600).
 * Perfect for demos and quick prototyping.
 *
 * **In production:** You should fetch ImageData from your API instead.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { DEMO_IMAGES } from '$lib/SvelteImageCrop/utils/demoData';
 * </script>
 *
 * <SicImageEditor
 *   {...DEMO_IMAGES.sneaker}
 *   availableCrops={crops}
 * />
 * ```
 */

import type { ImageData } from '../types/persistedStateTypes';
import { createDemoImageData } from './demoHelpers';

/**
 * Collection of pre-configured demo images
 *
 * Each image is a complete ImageData object ready to use with SicImageEditor.
 * These images are hosted on Unsplash with standard dimensions (2400x1600).
 */
export const DEMO_IMAGES: Record<string, ImageData> = {
	/**
	 * Nike sneaker product photo
	 * Red sneaker on white background - perfect for e-commerce demos
	 */
	sneaker: createDemoImageData({
		originalUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=2400',
		title: 'Nike Sneaker',
		altText: 'Red Nike sneaker on white background'
	}),

	/**
	 * Luxury watch product photo
	 * Silver watch - ideal for jewelry/accessories demos
	 */
	watch: createDemoImageData({
		originalUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=2400',
		title: 'Luxury Watch',
		altText: 'Silver luxury watch product photo'
	}),

	/**
	 * Wireless headphones product photo
	 * Black headphones - good for electronics demos
	 */
	headphones: createDemoImageData({
		originalUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=2400',
		title: 'Wireless Headphones',
		altText: 'Black wireless headphones'
	}),

	/**
	 * Designer sunglasses product photo
	 * Sunglasses on reflective surface - fashion/accessories
	 */
	sunglasses: createDemoImageData({
		originalUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=2400',
		title: 'Designer Sunglasses',
		altText: 'Designer sunglasses on reflective surface'
	})
};
