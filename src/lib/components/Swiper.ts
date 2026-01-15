import { browser } from '$app/environment';

export async function registerSwiperElements() {
	if (!browser) return;

	// Registra <swiper-container> y <swiper-slide>
	const mod = await import('swiper/element/bundle');
	mod.register();
}
