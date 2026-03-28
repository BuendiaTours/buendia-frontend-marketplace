import { MediaVariantPreset } from '$core/multimedia/enums';

type ImageCropVariant = {
	id: string;
	format: 'JPEG' | 'PNG' | 'WEBP';
	preset: string;
	width: number;
	height: number;
};

export const imageCropVariants: ImageCropVariant[] = [
	{ id: '', format: 'JPEG', preset: MediaVariantPreset.HERO_DESKTOP, width: 1920, height: 1080 },
	{ id: '', format: 'JPEG', preset: MediaVariantPreset.HERO_MOBILE, width: 768, height: 1024 },
	{ id: '', format: 'JPEG', preset: MediaVariantPreset.CARD, width: 400, height: 300 },
	{ id: '', format: 'JPEG', preset: MediaVariantPreset.THUMBNAIL, width: 200, height: 200 }
];
